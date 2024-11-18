import mongoose from "mongoose";
import {SubTaskModel} from "../models/subTasks.js";


const subTaskHelpers = {
    addSubTask:async(subTaskData)=>{
        try {
            const newSubTask = new SubTaskModel(subTaskData);
            return await newSubTask.save();
        } catch (error) {
            console.error('Error saving subtask:', error);
            throw error;
        }
    },
    findSubTaskByName:async(task)=>{
        return await SubTaskModel.findOne({isActive:true,task},{_id:1});
    },
    updateSubTaskName:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{task:value.name}});
        } catch (error) {
            console.error('Error updating name:', error);
            throw error;
        }
    },
    updateSubTaskNote:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{notes:value.notes}});
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    },
    updateSubTaskStatus:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{status:value.status}});
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },
    updateSubTaskClient:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{client:value.client}});
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    },
    updateSubTaskPriority:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{priority:value.priority}});
        } catch (error) {
            console.error('Error updating priority:', error);
            throw error;
        }
    },
    updateDueDate:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{dueDate:value.dueDate}});
        } catch (error) {
            console.error('Error updating due date:', error);
            throw error;
        }
    },
    updateDynamicField:async({subTaskId,field,value})=>{
        try {
            return await SubTaskModel.updateOne({_id:subTaskId},{$set:{[field]:value}});
        } catch (error) {
            console.error('Error updating due date:', error);
            throw error;
        }
    },
    updatePeople:async(_id,peopleId,isAdded)=>{
        try {
            if(isAdded === true){
                const people = new mongoose.Types.ObjectId(peopleId)
                return await SubTaskModel.updateOne({_id},{$addToSet:{people}});
            }else{
                return await SubTaskModel.updateOne({_id},{$pull:{people:peopleId}});
            }
        } catch (error) {
            console.error('Error assigning/removing person:', error);
            throw error;
        }
    },
    removeSubTask:async(_id)=>{
        try {
            return await SubTaskModel.updateOne({_id},{$set:{isActive:false}});
        } catch (error) {
            console.error('Error removing sub task:', error);
            throw error;
        }
    },
    removeAllSubTasks:async(taskId)=>{
        try {
            return await SubTaskModel.updateMany({taskId},{$set:{isActive:false}});
        } catch (error) {
            console.error('Error removing sub tasks:', error);
            throw error;
        }
    },
    findSubTasksForRemoval:async(taskId)=>{
        const subTasks = await SubTaskModel.find({taskId},{_id:1}).lean()
        return subTasks.map(subTask=>subTask._id.toString())
    },
    dndSubTaskUpdate: async (_id,order) => {
        try {
          return await SubTaskModel.updateOne({ _id }, { $set: { order } })
        } catch (error) {
          console.error('Error updating sub task order:', error);
          throw error;
        }
    }
}

export default subTaskHelpers;