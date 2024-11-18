import configKeys from './configKeys.js'

const serverConnection = (app)=>{
    try{
        const port = parseInt(configKeys.PORT)
        app.listen(port,'0.0.0.0',()=>{
            console.log(`Server started on http://localhost:${configKeys.PORT}`);
        })
    }catch(error){
        console.error('Error starting server',error);
    }
}

export default serverConnection