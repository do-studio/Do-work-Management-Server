
let activeUsers = []

const socketConfig = (io)=>{
    io.on('connection',(socket)=>{
        console.log('a user connected:', socket.id);
        socket.on('joinRoom', (user, room) => {
            socket.join(room);
            activeUsers.push({ id: socket.id, user, room });
            io.to(room).emit('userList', activeUsers.filter(user => user.room === room));
          });
        
          socket.on('chatMessage', (msg) => {
            // const user = activeUsers.find(user => user.id === socket.id);
            // if (user) {
              socket.broadcast.emit('chatMessage',msg);
            // }
          });
          
          // Project updations
          socket.on("headerWidth-updation",(data)=>{
            socket.broadcast.emit("headerWidth-updated",data)
          })
          socket.on("addRemoveProject-updation",(data)=>{
            socket.broadcast.emit("addRemoveProject-updated",data)
          })
          socket.on("editProject-updation",(data)=>{
            socket.broadcast.emit("editProject-updated",data)
          })
          socket.on("addHeader-updation",(data)=>{
            socket.broadcast.emit("addHeader-updated",data)
          })
          socket.on("addTask-updation",(data)=>{
            socket.broadcast.emit("addTask-updated",data)
          })
          socket.on("removeTask-updation",(data)=>{
            socket.broadcast.emit("removeTask-updated",data)
          })
          socket.on("addSubTask-updation",(data)=>{
            socket.broadcast.emit("addSubTask-updated",data)
          })
          socket.on("removeSubTask-updation",(data)=>{
            socket.broadcast.emit("removeSubTask-updated",data)
          })
          socket.on("taskName-updation",(data)=>{
            socket.broadcast.emit("taskName-updated",data)
          })
          socket.on("subTaskName-updation",(data)=>{
            socket.broadcast.emit("subTaskName-updated",data)
          })
          socket.on("subTaskNotes-updation",(data)=>{
            socket.broadcast.emit("subTaskNotes-updated",data)
          })
          socket.on("subTaskStatusPriority-updation",(data)=>{
            socket.broadcast.emit("subTaskStatusPriority-updated",data)
          })
          socket.on("dueDate-updation",(data)=>{
            socket.broadcast.emit("dueDate-updated",data)
          })
          socket.on("subTaskPeople-updation",(data)=>{
            socket.broadcast.emit("subTaskPeople-updated",data)
          })
          socket.on("dynamicField-updation",(data)=>{
            socket.broadcast.emit("dynamicField-updated",data)
          })
          socket.on("statusPriorityHeader-updation",(data)=>{
            socket.broadcast.emit("statusPriorityHeader-updated",data)
          })

        socket.on('disconnect',()=>{
            activeUsers = activeUsers.filter((user)=>user.id !== socket.id)
            io.emit("userList", activeUsers)
            console.log(`user disconnected: ${socket.id}`)
        })
    })
}

export default socketConfig