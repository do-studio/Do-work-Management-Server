import ClientModel from "../models/clients.js";

const clientHelpers = {
  addClient: async (option) => {
    const newClient = new ClientModel(option);
    const savedClient = await newClient.save();
    const updated = savedClient.toObject();
    delete updated.__v;
    return updated;
  },

  clientExists: async () => await ClientModel.exists({ isActive: true }),

  findClientByName: async (client) => {
    return await ClientModel.findOne({ client, isActive: true }, { _id: 1 });
  },

  getAllClients: async () => {
    return await ClientModel.find({ isActive: true }, { __v: 0 }).sort({
      client: 1,
    });
  },

  deleteClientById: async (id) => {
    // Instead of deleting, mark as inactive
    const updatedClient = await ClientModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return updatedClient;
  },
  removeCalendarClient: async (id) => {
    // Instead of deleting, mark as inactive
    const updatedClient = await ClientModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return updatedClient;
  },
};

export default clientHelpers;
