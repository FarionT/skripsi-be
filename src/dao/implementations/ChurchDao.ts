import models from '../../models';
import IChurchDao from '../contracts/IChurchDao';
import SuperDao from './SuperDao';

const { church: Church } = models;

export default class ChurchDao extends SuperDao implements IChurchDao {
    constructor() {
        super(Church);
    }
}
