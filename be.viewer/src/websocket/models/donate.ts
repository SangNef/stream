import { ConfigModel, Donate, Stream, User } from "~/models";
import { DonateModelEntity } from "~/type/app.entities";

export const addNewDonate = async (sub: number, data: Partial<DonateModelEntity>) => {
    try {
        const infoStream = await Stream.findByPk(data.stream_id);
        const infoCreator = await User.findByPk(infoStream?.user_id);
        const creatorBalance = parseInt(infoCreator?.balance as any);
        const infoUser = await User.findByPk(sub);
        const userBalance = parseInt(infoUser?.balance as any);

        if(userBalance < data.amount!) return 'Enough Money!';
        const persentConfig = await ConfigModel.findOne({
            where: { key: 'donate-percent' }
        });
        const percent = parseInt(persentConfig?.value!) / 100;

        const updateBalanceUser = userBalance - data.amount!;
        const updateBalanceCreator = creatorBalance + (data.amount! * percent);
        await User.update(
            { balance: updateBalanceUser }, { where: { id: sub } }
        );
        await User.update(
            { balance: updateBalanceCreator }, { where: { id: infoCreator?.id } }
        )

        const formatDonate = {
            user_id: sub,
            item_id: (data.item_id || null) as any,
            stream_id: data.stream_id!,
            amount: data.amount!
        }
        await Donate.create(formatDonate);
        return true;
    } catch (error) {
        console.error('[WebSocket --- Donate]:: Error: ', error);
    }
}