import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';
import Cache from '../../lib/Cache';

class AppointmentController {
  async index(req, res) {
    const { page = 1, pageSize = 20 } = req.query;

    const cacheKey = `user:${req.userId}:appointments:page:${page}:size:${pageSize}`;

    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

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

    await Cache.set(cacheKey, appointments);

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
    await CancelAppointmentService.run({
      appointmentId: req.params.id,
      userId: req.userId,
    });
    return res.status(204).json();
  }
}

export default new AppointmentController();
