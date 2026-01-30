import Diamond from '../../models/diamond.model.js';

export class DiamondService {
  static async createDiamond(data: {
    name: string;
    image_url?: string;
    base_price: string;
  }) {
    const diamond = await Diamond.create({
      name: data.name,
      image_url: data.image_url || null,
      base_price: data.base_price,
    });

    return diamond;
  }

  static async getAllDiamonds() {
    return Diamond.findAll({
      order: [['created_at', 'DESC']],
    });
  }

  static async updateDiamond(
    id: string,
    data: {
      name?: string;
      image_url?: string;
      base_price?: string;
    }
  ) {
    const diamond = await Diamond.findByPk(id);

    if (!diamond) {
      throw new Error('Diamond not found');
    }

    await diamond.update(data);
    return diamond;
  }
}
