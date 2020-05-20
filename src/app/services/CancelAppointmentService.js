import { isBefore, subHours } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import BadRequestError from '../custom/errors/BadRequestError';
import UnauthorizedError from '../custom/errors/UnauthorizedError';
import Cache from '../../lib/Cache';

class CancelAppointmentService {
  async run({ appointmentId, userId }) {
    const appointment = await Appointment.findByPk(appointmentId, {
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

    if (!appointment)
      throw new BadRequestError('This Appointment does not exists');

    if (appointment.user_id !== userId)
      throw new UnauthorizedError(
        'You cannot have permission to cancel this appointment'
      );

    if (appointment.canceled_at)
      throw new BadRequestError('This appointment is already canceled');

    // //TODO: Add parameter to hour, to remove hardcode
    const maxDateAllowedToCancel = subHours(appointment.date, 2);

    if (isBefore(maxDateAllowedToCancel, new Date()))
      throw new UnauthorizedError(
        'You can only cancel appointment 2 hours in advance'
      );

    appointment.canceled_at = new Date();

    appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    await Cache.clearPrefix(`user:${userId}`);

    return appointment;
  }
}
export default new CancelAppointmentService();
