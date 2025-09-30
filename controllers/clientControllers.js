import Joi from "joi"
import notificationHelpers from "../helpers/notificationHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import clientHelpers from "../helpers/clientHelpers.js"
import ClientModel from "../models/clients.js"


const clientControllers = () => {

    const addClient = async (req, res) => {
        try {
            const clientSchema = Joi.object({
                client: Joi.string()
                    .min(1)
                    .max(18)
                    .required(),
            })
            const { error, value } = clientSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.client = value.client.toLowerCase()
            const clientExists = await clientHelpers.findClientByName(value.client)
            if (clientExists) {
                return res.status(409).json({ status: false, message: "Client already exists" })
            }

            const assigner = req.payload.id
            const [clientResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    clientHelpers.addClient(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `added new clients : ${value.client}` })
                ]
            )

            if (clientResponse && notificationResponse) {
                return res.status(200).json({ status: true, message: "Client added", data: clientResponse, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error adding clients" })
        } catch (error) {
            console.log(error);

            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getClients = async (req, res) => {
        try {
            const getResponse = await clientHelpers.getAllClients()
            return res.status(200).json({ status: true, data: getResponse })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getCalendarClients = async (req, res) => {
        try {
            const getResponse = await ClientModel.find({ isActive: true, showCalendar: true }, { __v: 0 }).sort({
                client: 1,
            });
            return res.status(200).json({ status: true, data: getResponse })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const deleteClient = async (req, res) => {

        const { id } = req.params; // Get the client ID from the URL parameter

        try {
            const deleteResponse = await clientHelpers.deleteClientById(id); // Assuming this helper function deletes the client by ID

            if (deleteResponse) {
                return res.status(200).json({ status: true, message: "Client deleted successfully" });
            } else {
                return res.status(404).json({ status: false, message: "Client not found" });
            }
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" });
        }
    };

    const toggleCalendarClient = async (req, res) => {
        const { id } = req.params; // client id from URL
        const { showCalendar } = req.body; // true/false flag

        try {
            const updatedClient = await ClientModel.findByIdAndUpdate(
                id,
                { showCalendar }, // set to passed value
                { new: true }
            );

            if (!updatedClient) {
                return res.status(404).json({ status: false, message: "Client not found" });
            }

            return res.status(200).json({
                status: true,
                message: `Client ${showCalendar ? "added to" : "removed from"} calendar`,
                data: updatedClient,
            });
        } catch (error) {
            console.error("Error updating client showCalendar:", error);
            return res.status(500).json({ status: false, message: "Internal server error" });
        }
    };


    return {
        addClient,
        getClients,
        deleteClient,
        getCalendarClients,
        toggleCalendarClient
    }
}

export default clientControllers;