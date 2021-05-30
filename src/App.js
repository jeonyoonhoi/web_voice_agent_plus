import './App.css';
import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import firebase from 'firebase/app';
import {firebaseConfig} from './config';

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

class App extends Component {

	constructor() {
		super();
		this.state = {
			username: '',
			phonenumber: ''
		}

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChangeUsername = this.handleChangeUsername.bind(this)
		this.handleChangePhonenumber = this.handleChangePhonenumber.bind(this)
		this.agentListen = this.agentListen.bind(this);
		this.agentSpeak = this.agentSpeak.bind(this);

		if(!firebase.apps.length) {
			this.db = firebase.initializeApp(firebaseConfig);
		} else {
			this.db = firebase.app();
		}
	}

	handleSubmit(event) {
		event.preventDefault();
		this.props.history.push({
			pathname: '/Agent',
			state: {
				userid: this.state.username + '_' + this.state.phonenumber
			}
		})
	}

	handleChangeUsername(event) {
		this.setState({
			username: event.target.value
		})
	}

	handleChangePhonenumber(event) {
		const re =/^[0-9\b]+$/;
		if (event.target.value === '' || re.test(event.target.value)) {
			this.setState({
				phonenumber: event.target.value
			})
		}
	}

	agentListen() {
		sleep(1000);

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
		const recognition = new SpeechRecognition()

		recognition.continous = true
		recognition.interimResults = true
		recognition.lang = 'ko-KR' //'ko-KR'

		let finalTranscript = ""

		recognition.start();

		recognition.onresult = event => {
			let interimTranscript = ''

			for (let i=event.resultIndex; i<event.results.length; i++){
			const transcript = event.results[i][0].transcript;
			if (event.results[i].isFinal) finalTranscript += transcript + ' ';
			else interimTranscript += transcript;
			}
		}

		recognition.onend = event => {
			if(finalTranscript==='안녕하세요 '){
				recognition.stop();
				this.agentSpeak(finalTranscript, true);
			} else {
				this.agentSpeak('안녕하세요 를 따라 읽어주세요', false);
			}
			console.log(finalTranscript)
		}
	}

	agentSpeak(text, isFine) {
		sleep(1000);
		const utter = new SpeechSynthesisUtterance()

		utter.lang = 'ko-KR'
		utter.volume = 1.0
		utter.text = text;
		utter.voice = window.speechSynthesis.getVoices()[11];

		utter.onend = event => {
			if(isFine){
				document.getElementById('start-hoihoi').style.visibility = "visible";
				document.getElementById('mic-test').style.visibility = 'hidden';
				document.getElementById('the-title').innerHTML = '안녕하세요? </br>저는 환경부 산하 녹색환경안전공단에서 개발된 에이전트입니다.</br>생활 속 재활용 방법에 대한 정보를 제공하기 위하여 개발되었어요! ';
				document.getElementById('subheader').innerHTML = '</br> 시작하기 전에 이름과 휴대폰번호 뒤의 네자리를 입력해주세요.';
				document.getElementById('mic-utter').style.visibility = 'hidden';
				window.speechSynthesis.cancel();

			} else {
				this.agentListen()
			}
		}

		window.speechSynthesis.speak(utter);
		
	}


	render() {
		return (
			<div className="App">
				<h1 id='the-title'>Check the mic</h1>
				<h3 id='subheader'>마이크 버튼을 누르고 다음 문장을 따라 읽어주세요. </h3>
				<p id='mic-utter'>"안녕하세요"</p>

				<div id='mic-test'>
					<button id="mic-btn" onClick={this.agentListen}>
						<img id="mic-img" src='microphone.png' alt="" />
					</button>
				</div>

				{/*<Link to='/Page2'><button>start HoiHoi</button></Link>*/}
				<div id='start-hoihoi'>
					<form id="name-form" onSubmit={this.handleSubmit}>
						<label>
							<input id="first-name" placeholder='홍길동' type="text" value={this.state.username} onChange={this.handleChangeUsername}/>
							<input id="phone-number" placeholder='1234' type="text" maxLength="4" value={this.state.phonenumber} onChange={this.handleChangePhonenumber}/>
						</label>        
						<input id="submit-btn" type="submit" value="제출" />
					</form>
				</div>
			</div>
		)
	}
}

export default withRouter(App);
