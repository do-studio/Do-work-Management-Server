import Counters from "../models/counters.js";

export const getNextSequence = async(counterType="taskCounter",incrementCount=1) => {
    var ret = await Counters.findOneAndUpdate(
        {_id: counterType},{ $inc: { seq: incrementCount } },
        {new: true, upsert: true}
    );
    return ret.seq
}