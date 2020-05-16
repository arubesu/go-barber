import Sequelize, { Model } from 'sequelize';

class ProviderSchedule extends Model {
  static init(sequelize) {
    super.init(
      {
        start_hour: Sequelize.TIME,
        end_hour: Sequelize.TIME,
        provider_id: Sequelize.INTEGER
      },
      {
        sequelize
      }
    );
    return this;
  }
}

export default ProviderSchedule;
