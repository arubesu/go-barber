import ProviderSchedule from '../models/ProviderSchedule';
import User from '../models/User';

class ProviderScheduleController {
  async index(req, res) {
    const { userId } = req;

    const { start_hour, end_hour } = await ProviderSchedule.findOne({
      where: {
        provider_id: userId,
      },
    });

    return res.json({ start_hour, end_hour });
  }

  async store(req, res) {
    const { startHour, endHour } = req.body;
    const { userId } = req;

    const provider = await User.findOne({
      where: {
        id: userId,
        provider: true,
      },
    });

    if (!provider)
      return res
        .status(401)
        .json({ error: 'Only providers can set your schedule time' });

    const currentProviderSchedule = await ProviderSchedule.findOne({
      where: {
        provider_id: userId,
      },
    });

    const parsedStart = `${startHour}:00`;
    const parsedEnd = `${endHour}:00`;

    if (!currentProviderSchedule) {
      const providerSchedule = await ProviderSchedule.create({
        provider_id: userId,
        start_hour: parsedStart,
        end_hour: parsedEnd,
      });

      return res.json(providerSchedule);
    }

    currentProviderSchedule.start_hour = parsedStart;
    currentProviderSchedule.end_hour = parsedEnd;

    currentProviderSchedule.save();

    return res.json(currentProviderSchedule);
  }
}

export default new ProviderScheduleController();
