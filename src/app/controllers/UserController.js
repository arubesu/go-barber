import User from '../models/User'

import messages from '../../util/messages';

const userEmailExists = async (req) => {
  return await User.findOne({ where: { email: req.body.email } });
}

class UserController {

  async store(req, res) {

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
