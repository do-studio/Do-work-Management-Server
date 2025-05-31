import express from 'express'
import billingControllers from '../controllers/billingControllers.js'

const billingRoutes = () => {
    const router = express.Router();
    // const controllers = billingControllers()

    // Get all payment records
    router.get('/', billingControllers.getBillings);

    // // Create a new payment record
    router.post('/', billingControllers.createBilling);

    // // Get a single payment record
    router.get('/:id', billingControllers.getBilling);

    // // Update a payment record
    router.put('/:id', billingControllers.updateBilling);

    // // Delete a payment record
    router.delete('/:id', billingControllers.deleteBilling);

    return router
}


export default billingRoutes