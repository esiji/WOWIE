
const deleteHandler = async (id) => {
    await fetch(`/characters/${id}`, {
        method: 'delete'
    }).then(res => {
        window.location.reload(true)
    })
    
}


const updateHandler = async (id) => {
    await fetch(`/characters/${id}`, {
        method: 'put'
    }).then(res => {
        window.location.reload(true)
    })
}