import { isBefore, subHours } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import CreateAppointmentService from '../services/CreateAppointmentService';

class AppointmentController {
  async index(req, res) {
    const { page = 1, pageSize = 20 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;

    const appointment = await CreateAppointmentService.run({
      providerId: provider_id,
      date,
      userId: req.userId,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!appointment) {
      return res
        .status(400)
        .json({ error: 'This Appointment does not exists' });
    }

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You cannot have permission to cancel this appointment',
      });
    }

    if (appointment.canceled_at) {
      return res
        .status(400)
        .json({ error: 'This appointment is already canceled' });
    }

    // //TODO: Add parameter to hour, to remove hardcode
    const maxDateAllowedToCancel = subHours(appointment.date, 2);

    if (isBefore(maxDateAllowedToCancel, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cancel appointment 2 hours in advance' });
    }

    appointment.canceled_at = new Date();

    appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
