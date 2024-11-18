import ClientModel from "../models/clients.js";


const clientHelpers = {
  addClient: async (option) => {
    const newClient = new ClientModel(option)
    const savedClient = await newClient.save()
    const updated = savedClient.toObject()
    delete updated.__v
    return updated
  },
  clientExists: async () => await ClientModel.exists(),
  findClientByName: async (client) => {
    return await ClientModel.findOne({ client }, { _id: 1 })
  },
  getAllClients: async () => {
    return await ClientModel.find({}, { __v: 0 })
  },
  deleteClientById: async (id) => {
    const deletedClient = await ClientModel.findByIdAndDelete(id);
    return deletedClient
  }
}

export default clientHelpers;