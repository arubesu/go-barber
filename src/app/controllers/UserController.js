import * as Yup from 'yup';

import User from '../models/User'

import messages from '../../util/messages';

const userEmailExists = async (req) => {
  return await User.findOne({ where: { email: req.body.email } });
}

const minLengthPassword = 8;

class UserController {

  async store(req, res) {

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(minLengthPassword),
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    if (await userEmailExists(req)) {
      return res.status(400).json({ error: messages.error.user.alreadyExists });
    }

    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id, name, email, provider
    });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(minLengthPassword),
      password: Yup.string().min(minLengthPassword).when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
      passwordConfirmation: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      if (await userEmailExists(req)) {
        return res.status(400).json({ error: messages.error.user.alreadyExists });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: messages.error.user.passwordInvalid })
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id, name, email, provider
    });
  }
}

export default new UserController();
