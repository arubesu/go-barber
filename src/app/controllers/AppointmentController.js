import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt'
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {

  async index(req, res) {
    const { page = 1, pageSize = 20 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: ['date'],
      attributes: ['id', 'date'],
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
            }
          ]
        }
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {

    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if is provider
     */
    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      return res.status(401).json({ error: 'This user is not a service provider' });
    }

    /**
     * Check if it's past date
     */

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(401).json({ error: 'Past dates are not allowed' });
    }

    /**
     * Check if schedule is available
     */

    const existsAppointment = await Appointment.count({
      where: {
        provider_id,
        date: hourStart,
        canceled_at: null,
      }
    })

    if (existsAppointment) {
      return res.status(400).json({ error: 'Appointment date is not available' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM 'de' yyyy ', às ' HH:mm'h'",
      { locale: pt }
    )

    await Notification.create({
      //TODO: Add Internationalization
      content: `Novo Agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id
    })

    return res.json(appointment);
  }
}

export default new AppointmentController();
