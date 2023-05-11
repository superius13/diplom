;((D, B, log = arg => console.log(arg)) => {
    // наш код
    // это позволит обращаться к document и document.body как к D и B, соответственно
    // log = arg => console.log(arg) - здесь мы используем параметры по умолчанию
    // это позволит вызывать console.log как 

    const dropZone = D.querySelector('div')
    const input = D.querySelector('input')
    let file

    D.addEventListener('dragover', ev => ev.preventDefault())
    D.addEventListener('drop', ev => ev.preventDefault())

    dropZone.addEventListener('drop', ev => {
    // отключаем поведение по умолчанию
    ev.preventDefault()

    // смотрим на то, что получаем
    log(ev.dataTransfer)

    file = ev.dataTransfer.files[0]

    log(file)
    handleFile(file)

    const handleFile = file => {
    dropZone.remove()
    input.remove()
    }
    })
})(document, document.body)