import { Op } from 'sequelize';
import { startOfDay, endOfDay, format, isAfter } from 'date-fns';
import Appointment from '../models/Appointment';
import ProviderSchedule from '../models/ProviderSchedule';
import BadRequestError from '../custom/errors/BadRequestError';

class AvailableService {
  async run({ providerId, searchDate }) {
    const appointments = await Appointment.findAll({
      where: {
        provider_id: providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const providerSchedule = await ProviderSchedule.findOne({
      where: {
        provider_id: providerId,
      },
    });

    if (!providerSchedule)
      throw new BadRequestError("There's no provider with this id");

    const { start_hour, end_hour } = providerSchedule;

    if (!start_hour || !end_hour)
      throw new BadRequestError('The provider must have the schedule set');

    const [start] = start_hour.split(':');
    const [end] = end_hour.split(':');

    const availability = [];

    const today = new Date();
    const currentDateTime = new Date();

    for (let hour = start; hour < end; hour++) {
      today.setHours(hour, 0, 0);

      const available =
        isAfter(today, currentDateTime) &&
        !appointments.some(({ date }) => date.getHours() === hour);

      availability.push({
        time: `${format(today, 'HH:mm')}`,
        value: `${format(today, "yyyy-MM-dd'T'HH:mm:ssxxx")}`,
        available,
      });
    }

    return availability;
  }
}

export default new AvailableService();
