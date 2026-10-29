let Peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
let client = {}

//get video stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
    socket.emit('NewClient')
    video.srcObject = stream
    video.play()

    //Initialize peer
    function InitPeer(type){
        let peer = new Peer({initiator: (type == 'init') ? true : false, stream:stream, trickle:false })
        peer.on('stream', function(stream){
            CreateVideo(stream)
        })
        return peer
    }

    //Peer that sends offer i.e. peer type init
    function MakePeer(){
        client.gotAnswer = false
        let peer = InitPeer('init')
        peer.on('signal', function(data){
            if(!client.gotAnswer){
                socket.emit('Offer',data)
            }
        })
        client.peer = peer
    }

    //Peer that sends answer i.e. peer type not init
    function FrontAnswer(offer){
        let peer = InitPeer('notInit')
        peer.on('signal', (data) => {
            socket.emit('Answer', data)
        })
        peer.signal(offer)
        client.peer = peer
    }

    function SignalAnswer(answer){
        client.gotAnswer = true
        let peer = client.peer
        peer.signal(answer)
    }

    function CreateVideo(stream){

        let video = document.createElement('video')
        video.id = 'peerVideo'
        video.srcObject = stream
        video.setAttribute('class', 'peerVideo')                       
        document.querySelector('#peerDiv').appendChild(video)
        video.play()

        $('.speaker').click(function(e) {
            e.preventDefault();
        
            if (video.volume != 0)
                video.volume = 0
            else
                video.volume = 1
              $(this).toggleClass('mute');
        });
    }

    function SessionActive(){
        //document.write("Session is Active. Please come back later!")
        window.location.replace("pages/siteBusy.html");
    }

    function RemovePeer() {
        document.getElementById("peerVideo").remove();
        if (client.peer) {
            client.peer.destroy()
        }
    }

    socket.on('BackOffer', FrontAnswer)
    socket.on('BackAnswer', SignalAnswer)
    socket.on('SessionActive', SessionActive)
    socket.on('CreatePeer', MakePeer)
    socket.on('Disconnect', RemovePeer)

})
.catch(err => document.write(err))
