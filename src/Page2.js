// 'use strict'

import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import firebase from 'firebase';
import {firebaseConfig} from './config';

// SPEECH RECOGNITION/SYNTHESIS SETUP
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'ko-KR' //'ko-KR'

const utter = new SpeechSynthesisUtterance()

// utter.rate = 0.8
let username = '';

// let voices = window.speechSynthesis.getVoices()
// console.log(voices)

let all_subjects = ['편의점', '배달 음식', '택배', '홈파티', '일상'];

// COMPONENT
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

class Page2 extends Component{

	constructor() {
		super();
		this.state = {
			chance: 1,
			c_question: 1, 
			counter: 0,
			username: '', 
			questions: [],
			subjects: [],
			explanations: [],
			answers: [],
			answer_a: [],
			answer_b: [],
			explanation_a: [],
			explanation_b: [],      
			user_full_answer: '',
			keyword_extraction: '',
		}

		this.startHoiHoi = this.startHoiHoi.bind(this);
		this.agentListen = this.agentListen.bind(this);
		this.agentSpeak = this.agentSpeak.bind(this);
		this.confirmAnswer = this.confirmAnswer.bind(this);
		this.repeatQuestion = this.repeatQuestion.bind(this);
		this.writeUserData = this.writeUserData.bind(this);
		this.nextQuestion = this.nextQuestion.bind(this);
		this.answerSetChecking = this.answerSetChecking.bind(this);

		if(!firebase.apps.length) {
			this.page2 = firebase.initializeApp(firebaseConfig);
		} else {
			this.page2 = firebase.app();
		}

	}

	componentDidMount() {

		this.setState({
			username:username
		});
		//console.log(this.state.username)

		const questionsRef = this.page2.database().ref('question');
		questionsRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				questions:newState
			})

		})

		const subjectsRef = this.page2.database().ref('subject');
		subjectsRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				subjects:newState
			})
		})

		const explanationsRef = this.page2.database().ref('explanation');
		explanationsRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				explanations:newState
			})
		})

		const answersRef = this.page2.database().ref('answer');
		answersRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				answers:newState
			})
		})

		const answerARef = this.page2.database().ref('answer_a');
		answerARef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				answer_a:newState
			})
		})

		const answerBRef = this.page2.database().ref('answer_b');
		answerBRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				answer_b:newState
			})
		})

		const explanationARef = this.page2.database().ref('explanation_a');
		explanationARef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				explanation_a:newState
			})
		})

		const explanationBRef = this.page2.database().ref('explanation_b');
		explanationBRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) {
				newState.push(rows[i])
			}
			this.setState({
				explanation_b:newState
			})
		})
	}

	agentListen(state){

		sleep(1000);

		// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
		// const recognition = new SpeechRecognition()
		// recognition.continous = true
		// recognition.interimResults = true
		// recognition.lang = 'ko-KR' //'ko-KR'

		// let counter = this.state.counter;
		// let c_question = this.state.c_question;

		console.log("username:", this.state.username)
		console.log("counter:", this.state.counter)
		console.log("state:", state)
		console.log("question counter:", this.state.c_question)
		console.log(this.state.questions[this.state.counter])
		console.log(this.state.explanations[this.state.counter])
		// console.log(finish)

		if(typeof this.state.questions[this.state.counter] === 'undefined'){
			this.setState({
				counter:this.state.counter + 1
			});
			//this.state.counter += 1;
			document.getElementById('the-title').innerHTML = '갑사합니당'; 
			this.agentSpeak('여기까지 다 됐습니다.  갑사합니당', 1);

		} else if(this.state.questions[this.state.counter] === ''){
			document.getElementById('the-title').innerHTML = '(문제설명 하는 중)'; 
			this.agentSpeak(this.state.subjects[this.state.counter], 1) 
			this.setState({
				counter:this.state.counter + 1
			});

		} else if (state === 1){
			document.getElementById('the-title').innerHTML = '진행상황: ' + this.state.c_question + ' / 25';
			sleep(1000);
			this.agentSpeak("문제 " + this.state.c_question +" 번 입니다.                  " + 
							 this.state.questions[this.state.counter], 1.5);
			//state = 2;  
		} else if (state === 1.5) {
			console.log(state)
			sleep(1000);
			this.agentSpeak( "두 가지 보기를 드릴게요." + 
							 "첫 번째     :     " + this.state.explanation_a[this.state.counter]
							 , 1.75);
		} else if (state === 1.75) {
			console.log(state)
			sleep(1000);
			this.agentSpeak( "두 번째     :     " + this.state.explanation_b[this.state.counter] +
							 "            대답해 주세요."
							 , 2);
		} else {
			recognition.start();
		}

		let finalTranscript = '';

		recognition.onresult = event => {
			let interimTranscript = ''

			for (let i=event.resultIndex; i<event.results.length; i++){
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) finalTranscript += transcript + ' ';
				else interimTranscript += transcript;
			}
			document.getElementById('interim').innerHTML = interimTranscript;
			// document.getElementById('final').innerHTML = finalTranscript
		}

		recognition.onend = event => {
			recognition.stop()
			document.getElementById('interim').innerHTML = finalTranscript;
			if(finalTranscript===''){
				this.agentSpeak('다시 한번 말해주세요!', 2);
			} else if(state === 1){
				this.agentSpeak(this.state.questions[this.state.counter], 2)
				
			} else if (state === 2){
				//state = 3;
				this.setState({
					user_full_answer: finalTranscript,
					keyword_extraction: this.answerSetChecking(finalTranscript)
				});

				if(this.state.keyword_extraction===""){
					if(this.state.chance < 3){
						//state = 2;
						document.getElementById('final').innerHTML = finalTranscript;
						document.getElementById('chances').innerHTML = '기회 : '  + 
																		this.state.chance + '/ 3';
						
						//this.state.chance += 1;
						this.setState({
							chance:this.state.chance + 1,
						});

						this.agentSpeak('다시 한번 말해주세요!', 2);
					} else {
						document.getElementById('chances').innerHTML = '';
						this.setState({
							chance: 1,
						});
						this.confirmAnswer();
					}
				} else {
					this.setState({
						chance: 1,
					});
					document.getElementById('chances').innerHTML = '';
					document.getElementById('final').innerHTML = this.state.keyword_extraction;
	
					this.agentSpeak('당신의 정답은       ' + 
									this.state.keyword_extraction + 
									'       인가요??', 3); 
				} 
			}
		}
	}

	answerSetChecking(utterance){
		// let answers_set = ["일반", "종이", "스티로폼", "비닐", "음식물", "플라스틱"];

		let answers_set = [this.state.answer_a[this.state.counter], this.state.answer_b[this.state.counter],
							'첫 번째', '첫', '두 번째', '두', '일 번', '이 번', ' 일 ', ' 이 ', '1', '2']
		let first_answer = [this.state.answer_a[this.state.counter], '첫 번째', '첫', '일 번', ' 일 ', '1']
		let second_answer = [this.state.answer_b[this.state.counter], '두 번째', '두', '이 번', ' 이 ', '2']

		console.log(this.state.counter)
		
		for(let i = 0; i < answers_set.length; i++) {
			
			if (utterance.includes(answers_set[i])) {
				let word = answers_set[i]
				console.log(word)
				if(first_answer.includes(word))
					return this.state.answer_a[this.state.counter]
				else if(second_answer.includes(word))
					return this.state.answer_b[this.state.counter]
			}

		}

		return "";
	}

	agentSpeak(text, state) {

		utter.text = text
		utter.lang = 'ko-KR'
		utter.volume = 1.0
		utter.voice = window.speechSynthesis.getVoices()[11];

		console.log(state)

		utter.onstart = event => {
			document.getElementById("microphone-img").src="emoji_1.png";
			document.body.style.backgroundColor = "#F2F9FD";

			if(state===1){
				document.getElementById("question-show").innerHTML = text;
				document.getElementById("explanation-show").innerHTML = '';
			} else if(state > 1 && state < 2){
				document.getElementById("question-show").innerHTML = this.state.questions[this.state.counter];
				document.getElementById("explanation-show").innerHTML =  "<br> 1." + this.state.explanation_a[this.state.counter] +
				                                                         "<br><br> 2." + this.state.explanation_b[this.state.counter];

			} else if(state===4){
				document.getElementById("explanation-show").innerHTML = "<b>" + this.state.answers[this.state.counter-1] + "</b><br><br>" +
																		this.state.explanations[this.state.counter-1];
				document.getElementById('interim').style.visibility = 'hidden';
				document.getElementById('final').style.visibility = 'hidden';
			}
		}

		utter.onend = event => {
			window.speechSynthesis.cancel()

			if (state >= 2){
				document.getElementById('listening').style.visibility = 'visible';
				document.getElementById('interim').style.visibility = 'visible';
				document.getElementById('final').style.visibility = 'visible';
				document.getElementById("microphone-img").src="emoji_2.png";
				document.body.style.backgroundColor = "#FFEDF7";
			}		

			if(state===1.5){
				this.agentListen(1.5);
			} else if(state===1.75){
				this.agentListen(1.75);
			} else if(state===3){
				document.getElementById('listening').style.visibility = 'hidden';

				document.getElementById('confirmation-div').style.visibility = "visible";
				//this.state.visibility = 'visible';
			} else if (state===4){
				document.getElementById('listening').style.visibility = 'hidden';
				document.getElementById('interim').style.visibility = 'hidden';
				document.getElementById('final').style.visibility = 'hidden';
				document.getElementById('next-div').style.visibility = "visible";
			} else if (typeof this.state.questions[this.state.counter-1] !== 'undefined'){
				this.agentListen(state);
			}
		};

		window.speechSynthesis.speak(utter);
	}

	confirmAnswer(){
		document.getElementById('interim').innerHTML = '';
		document.getElementById('final').innerHTML = '';
		document.getElementById('confirmation-div').style.visibility = "hidden";
		//state = 4;
		// counter += 1;
		this.agentSpeak("정답은 " + this.state.answers[this.state.counter] + "입니다.                      " 
			+ this.state.explanations[this.state.counter], 4);

		// save data to database 
		// answer: finalTranscript
		// keyword: answers from keyword extraction

		this.writeUserData(
			this.state.username,
			"Q:" + String(this.state.c_question), 
			this.state.user_full_answer, 
			this.state.keyword_extraction,
		);

		this.setState({
			c_question:this.state.c_question + 1,
			counter:this.state.counter + 1,
		});
	}

	writeUserData(user_name, question_id, answer, keyword) {
		firebase.database().ref('user_log/' + user_name + '/' + question_id).set({
			answer: answer,
			keyword: keyword
		});
	}

	repeatQuestion(){
		document.getElementById('interim').innerHTML = '';
		document.getElementById('final').innerHTML = '';
		document.getElementById('confirmation-div').style.visibility = "hidden";
		let c = this.state.counter;
		this.agentSpeak(this.state.questions[c] + '    ' +
							"첫 번째     :     " + this.state.answer_a[c] + ',                                     ' +
							"            두 번째     :     " + this.state.answer_b[c], 2)
		// this.agentSpeak(this.state.questions[c], 2);

	}

	startHoiHoi(){
		document.getElementById('interim').innerHTML = '';
		document.getElementById('final').innerHTML = '';
		// document.getElementById('the-title').innerHTML = '(문제설명 하는 중)';    
		sleep(1000);
		//state = 1;
		this.setState({
			c_question: 1,
			counter: 0,
		});
		window.speechSynthesis.cancel();
		this.agentListen(1);
	}

	nextQuestion(){
		document.getElementById('final').innerHTML = '';
		document.getElementById('next-div').style.visibility = "hidden";
		window.speechSynthesis.cancel();
		sleep(1000);
		//state = 1;

		this.agentListen(1);
	}

	render() {
		//parse username to js
		// username = this.props.location.state.userid;
		//username = "test"
		return (
			<div style ={{ position:'relative', zIndex:'0' }}>       
				<div style={container}>
					<h1 id='the-title'>준비가 되면 아래 원숭이를 클릭해주세요. </h1>
					{/*<p id='questions'></p>*/}

					<button id="microphone-btn" style={start_button} onClick={this.startHoiHoi}>
						<img id="microphone-img" src='emoji_1.png' alt="" />
					</button>
					<div id='question-show' style={question_show}></div>

					<div id='explanation-show' style={explanation_show}></div>

					<div id="next-div" style={next_button}>
						<p style={{margin:'0 0 10px 0'}}>아래 버튼을 누르면 다음 문제로 넘어갑니다.</p>
						<button id='hidden-btn' onClick={this.nextQuestion}> 다음으로 </button>
					</div>   
					
					<div id="listen-box" style={{listen_box}}>
						<p id="listening" style={listen_text}>정답을 말해주세요</p>
						<div id='interim' style={interim}></div>
						<div id='final' style={final}></div>
						<p id='chances'></p>
					</div>					
				</div>		
				<div id="confirmation-div" style={hidden_div}>
					<button id="hidden-btn" style={{ margin:'0 20px'}} onClick={this.confirmAnswer}>네</button>
					<button id="hidden-btn" style={{ margin:'0 20px'}} onClick={this.repeatQuestion}>아니요</button>
				</div>     
			</div>
		)
	}
}


export default withRouter(Page2);


const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		textAlign: 'center',
		//position: 'absolute',
		zIndex:'0',
		width: '100%'
	},
	start_button: {
		// width: '60px',
		// height: '60px',
		background: 'lightblue',
		borderRadius: '50%',
		// margin: '6em 0 2em 0'
	},
	interim: {
		color: 'gray',
		border: '#ccc 1px solid',
		padding: '1em',
		margin: '1em',
		width: '300px',
		visibility: 'hidden'
	},
	final: {
		width:'100%',
		color: 'black',
		border: '#ccc 1px solid',
		padding: '1em',
		margin: '1em',
		width: '300px',
		visibility: 'hidden'
	},
	listen_box: {
		width:'100%',
		justifyContent:'center',
		textAlign:'center',
		alignItems: 'center',

	},
	listen_text: {
		width:'100%',
		visibility:'hidden', 
		margin:'20px 0 10px 0', 
		fontSize:'20px',
		fontWeight:'bold',
		color: '#777',
	},
	hidden_div: {   
		position:'absolute',
		width: '100%',
		justifyContent:'center',
		textAlign:'center',
		visibility:'hidden',
	},
	next_button: {
		//position:'absolute',
		width: '100%',
		height: '100%',
		margin:'20px 0 0 0',
		justifyContent: 'center',
		textAlign: 'center',
		visibility: 'hidden',
		fontSize: '20px'
	},
	question_show: {
		fontWeight:'bold',
		width: '500px',
		margin: '1em 1em 1em 1em',
		fontSize:'25px',

	},
	explanation_show: {
		width: '500px',
		margin: '1em',
		fontSize:'20px',
	}

}

const { container, start_button, hidden_div, interim, final, next_button, question_show, explanation_show, listen_box, listen_text } = styles