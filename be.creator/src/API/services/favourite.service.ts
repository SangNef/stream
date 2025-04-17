import { literal } from 'sequelize';
import { BadRequestResponse, NotFoundResponse } from '../core/ErrorResponse';
import Favourite from '../../models/favourite';
import Stream from '../../models/stream';
import { FavouriteModelEntity } from '~/type/app.entities';

class UserFavouriteService {
    // Lấy danh sách stream yêu thích.
    static getListStreamFavourite = async (userid: number) => {
        if(Number.isNaN(userid)) throw new BadRequestResponse('DataInput Invalid!');

        const result = await Favourite.findAll({
            attributes: [
                'id',
                [
                    literal(`(SELECT TIMESTAMPDIFF(SECOND, streams.start_time, streams.end_time) FROM streams WHERE streams.id = Favourite.stream_id)`), 
                    'timeLive'
                ]
            ],
            include: {
                model: Stream,
                as: 'streams',
                attributes: ['id', 'stream_url', 'thumbnail', 'view'],
            },
            where: { user_id: userid}
        });

        return result;
    }

    static addNewFavourite = async (data: Partial<FavouriteModelEntity>) => {
        if(!data.stream_id || !data.user_id) throw new BadRequestResponse('DataInput Invalid!');

        const streamExisted = await Stream.findByPk(data.stream_id);
        if(!streamExisted) throw new NotFoundResponse('Stream Not Exist!');

        const formatFavourite = {
            user_id: data.user_id,
            stream_id: data.stream_id
        }

        const result = await Favourite.create(formatFavourite);
        return result;
    }

    static unfavourite = async (data: Partial<FavouriteModelEntity>) => {
        if(Number.isNaN(data.id)) throw new BadRequestResponse('ParamInput Invalid!');

        const favourited = await Favourite.findOne({ where: {
            id: data.id,
            user_id: data.user_id
        }});
        if(!favourited) throw new NotFoundResponse('Favourite List NotFound!');

        const result = await Favourite.destroy({ where: { id: data.id}});
        return result;
    }
}

export default UserFavouriteService;