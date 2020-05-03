import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';

class Mail {
  constructor() {
    const { host, port, auth, secure } = mailConfig;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null
    });

    this.configureTemplates();
  }

  configureTemplates() {
    const emailPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    this.transporter.use('compile', nodemailerhbs({
      viewEngine: exphbs.create({
        layoutsDir: resolve(emailPath, 'layouts'),
        partialsDir: resolve(emailPath, 'partials'),
        defaultLayout: 'default',
        extname: '.hbs',
      }),
      emailPath,
      extname: '.hbs',
    })
    );

  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message
    });
  }

}

export default new Mail();
