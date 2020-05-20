import { parseISO, startOfHour, isBefore, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import BadRequestError from '../custom/errors/BadRequestError';
import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ providerId, date, userId }) {
    if (userId === providerId) {
      throw new BadRequestError('The userId and provider id cannot be equal');
    }

    /**
     * Check if is provider
     */
    const isProvider = await User.findOne({
      where: {
        id: providerId,
        provider: true,
      },
    });

    if (!isProvider) {
      throw new BadRequestError('This user is not a service provider');
    }

    /**
     * Check if it's past date
     */

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new BadRequestError('Past dates are not allowed');
    }

    /**
     * Check if schedule is available
     */

    const existsAppointment = await Appointment.count({
      where: {
        provider_id: providerId,
        date: hourStart,
        canceled_at: null,
      },
    });

    if (existsAppointment) {
      throw new BadRequestError('Appointment date is not available');
    }

    const appointment = await Appointment.create({
      user_id: userId,
      provider_id: providerId,
      date: hourStart,
    });

    const user = await User.findByPk(userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM 'de' yyyy ', às ' HH:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      // TODO: Add Internationalization
      content: `Novo Agendamento de ${user.name} para o ${formattedDate}`,
      user: providerId,
    });

    await Cache.clearPrefix(`user:${userId}`);

    return appointment;
  }
}

export default new CreateAppointmentService();
