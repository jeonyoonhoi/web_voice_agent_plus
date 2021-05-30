import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import firebase from 'firebase';
import { firebaseConfig } from './config';


// SPEECH RECOGNITION/SYNTHESIS SETUP
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'ko-KR' //'ko-KR'

const utter = new SpeechSynthesisUtterance()

// utter.rate = 0.8
let username = '';
let START = false;

// let voices = window.speechSynthesis.getVoices()
// console.log(voices)

let subject_counter = 0;
let question_counter = 0;
let all_subjects = ['편의점', '배달 음식', '택배', '홈파티', '일상'];

// COMPONENT
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

class Agent extends Component {

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

		if(!firebase.apps.length) {
			this.agent = firebase.initializeApp(firebaseConfig);
		} else {
			this.agent = firebase.app();
		}

		this.agentMain = this.agentMain.bind(this);
		this.startHoiHoi = this.startHoiHoi.bind(this);
		this.agentListen = this.agentListen.bind(this);
		this.agentSpeak = this.agentSpeak.bind(this);
		this.confirmAnswer = this.confirmAnswer.bind(this);
		this.repeatQuestion = this.repeatQuestion.bind(this);
		this.writeUserData = this.writeUserData.bind(this);
		this.nextQuestion = this.nextQuestion.bind(this);
		this.answerSetChecking = this.answerSetChecking.bind(this);
		// this.confirmQuestion = this.confirmQuestion.bind(this);
	}

	componentDidMount() {

		this.setState({ username:username });

		const questionsRef = this.agent.database().ref('question');
		questionsRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ questions:newState });
		})

		const subjectsRef = this.agent.database().ref('subject');
		subjectsRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ subjects:newState });
		})

		const explanationsRef = this.agent.database().ref('explanation');
		explanationsRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ explanations:newState });
		})

		const answersRef = this.agent.database().ref('answer');
		answersRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ answers:newState });
		})

		const answerARef = this.agent.database().ref('answer_a');
		answerARef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ answer_a:newState });
		})

		const answerBRef = this.agent.database().ref('answer_b');
		answerBRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ answer_b:newState });
		})

		const explanationARef = this.agent.database().ref('explanation_a');
		explanationARef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ explanation_a:newState });
		})

		const explanationBRef = this.agent.database().ref('explanation_b');
		explanationBRef.on('value', (snapshot) => {
			let rows = snapshot.val();
			let newState = [];
			for(let i in rows) { newState.push(rows[i]) };
			this.setState({ explanation_b:newState });
		})
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

	agentSpeak(text, state){
		sleep(1000);
		console.log('Speak state', state);

		document.getElementById('listening').style.visibility = 'hidden';
		document.getElementById('interim').style.visibility = 'hidden';
		document.getElementById('final').style.visibility = 'hidden';
		document.getElementById("microphone-img").src="emoji_1.png";
		document.body.style.backgroundColor = "#F2F9FD";

		const utter = new SpeechSynthesisUtterance()
		utter.text = text
		utter.lang = 'ko-KR'
		utter.volume = 1.0
		utter.voice = window.speechSynthesis.getVoices()[11];

		utter.onstart = event => {

			if(state===0){
				document.getElementById("question-show").innerHTML = text;
				document.getElementById("explanation-show").innerHTML = '';
			} else if(state===1 || state===1.2){
				document.getElementById("question-show").innerHTML = text;
				document.getElementById("explanation-show").innerHTML = '';
			} else if(state===1.40){
				document.getElementById("question-show").innerHTML = this.state.questions[this.state.counter];
				document.getElementById("explanation-show").innerHTML = '';
			} else if(state===1.60){
				document.getElementById("question-show").innerHTML = this.state.questions[this.state.counter];
				document.getElementById("explanation-show").innerHTML =  "<br> 1." + 
																this.state.explanation_a[this.state.counter];
			} else if(state===1.80){
				document.getElementById("question-show").innerHTML = this.state.questions[this.state.counter];
				document.getElementById("explanation-show").innerHTML =  "<br> 1." + 
																this.state.explanation_a[this.state.counter] +
				                                                         "<br><br> 2." + 
				                                                this.state.explanation_b[this.state.counter];
			} else if(state===2) {
				document.getElementById("question-show").innerHTML = this.state.questions[this.state.counter];
				document.getElementById("explanation-show").innerHTML =  "<br> 1." + 
																this.state.explanation_a[this.state.counter] +
				                                                         "<br><br> 2." + 
				                                                this.state.explanation_b[this.state.counter];
			} else if(state===3){
				document.getElementById('listening').style.visibility = 'hidden';
			} else if(state===4){
				document.getElementById("explanation-show").innerHTML = "<b>" + this.state.answers[this.state.counter] + "</b><br><br>" +
																		this.state.explanations[this.state.counter];
				document.getElementById('interim').style.visibility = 'hidden';
				document.getElementById('final').style.visibility = 'hidden';
			} else if(state===5){
				document.getElementById("explanation-show").innerHTML = "<b><" + this.state.subjects[this.state.counter] + ">는?</b>"  +
																		"</b><br><br>" +
																		"1. " + this.state.answer_a[this.state.counter] + '<br><br>' +
																		"2. " + this.state.answer_b[this.state.counter];
				document.getElementById('interim').style.visibility = 'visible';
				document.getElementById('final').style.visibility = 'visible';
			}
		};

		utter.onend = event => {
			window.speechSynthesis.cancel();

			if(state===0 && typeof this.state.questions[this.state.counter-1] !== 'undefined'){
				// After speaking the subject, should start with the questions
				this.agentMain(1);
			} else if(state===1) {
				this.agentSpeak(this.state.questions[this.state.counter], 1.20);
			} else if(state===1.20) {
				this.agentSpeak("두 가지 보기를 드릴게요.", 1.40);
			} else if(state===1.40) {
				this.agentSpeak("첫 번째:" + this.state.explanation_a[this.state.counter], 1.60);
			} else if(state===1.60) {
				this.agentSpeak("두 번째:" + this.state.explanation_b[this.state.counter], 1.80);
			} else if(state===1.80) {
				this.agentSpeak("대답해 주세요", 2);
			} else if(state===6){
				this.agentListen(6);
			} else {
				this.agentMain(state);
			}
		};

		window.speechSynthesis.speak(utter);

	}

	agentListen(state) {


		sleep(1000);

		document.getElementById('interim').innerHTML = '';
		document.getElementById('final').innerHTML = '';
		document.getElementById('listening').style.visibility = 'visible';
		document.getElementById('interim').style.visibility = 'visible';
		document.getElementById('final').style.visibility = 'visible';
		document.getElementById("microphone-img").src="emoji_2.png";
		document.body.style.backgroundColor = "#FFEDF7";

		console.log('Listen state', state);

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
		const recognition = new SpeechRecognition()

		recognition.continous = true
		recognition.interimResults = true
		recognition.lang = 'ko-KR' //'ko-KR'

		let finalTranscript = '';

		recognition.start();

		recognition.onresult = event => {
			let interimTranscript = '';

			for(let i=event.resultIndex; i<event.results.length; i++){
				const transcript = event.results[i][0].transcript;
				if(event.results[i].isFinal){ finalTranscript += transcript + ' '; } 
				else { interimTranscript += transcript; }
			}

			document.getElementById('interim').innerHTML = interimTranscript;
		}

		recognition.onend = event => {
			recognition.stop();
			document.getElementById('interim').innerHTML = finalTranscript;
			if(finalTranscript===''){
				this.agentSpeak('다시 한번 말해주세요!', state);

			} else if(state===2) {

				this.setState({
					user_full_answer:finalTranscript,
					keyword_extraction:this.answerSetChecking(finalTranscript),
				});	

				if(this.state.keyword_extraction===""){
					if(this.state.chance < 3){
						document.getElementById('final').innerHTML = finalTranscript;
						document.getElementById('chances').innerHTML = '기회 : ' +  this.state.chance + '/ 3';
						this.setState({ chance:this.state.chance+1 });
						this.agentSpeak('다시 한번 말해주세요!', 2);
					} else {
						document.getElementById('chances').innerHTML = '';
						this.setState({ chance: 1 });
						this.confirmAnswer();
					}
				} else {
					this.setState({ chance: 1, });
					document.getElementById('chances').innerHTML = '';
					document.getElementById('final').innerHTML = this.state.keyword_extraction;
					this.agentSpeak('당신의 정답은       ' + 
									this.state.keyword_extraction + 
									'       인가요??', 3); 								
				}
			} else if(state===3){
				document.getElementById('final').innerHTML = finalTranscript;
				if(finalTranscript==='네 '){
					document.getElementById('listening').style.visibility = 'hidden';
					this.confirmAnswer();
				} else if(finalTranscript==='아니요 '){
					document.getElementById('listening').style.visibility = 'hidden';
					this.repeatQuestion();
				} else {
					this.agentSpeak('다시 한번 말해주세요!', 3);
				}
			} else if(state===5){
				document.getElementById('final').innerHTML = finalTranscript;
				if(finalTranscript===this.state.answers[this.state.counter] + " "){
					document.getElementById('listening').style.visibility = 'hidden';
					
					this.agentMain(6);
				} else {
					this.agentMain(4);
				}
			} else if(state===6){
				document.getElementById('final').innerHTML = finalTranscript;
				if(finalTranscript==='네 '){
					this.writeUserData();
					this.nextQuestion();
				} else if(finalTranscript==="아니요 ") {
					this.agentMain(1);
				} else {
					this.agentSpeak('다시 한번 말해주세요!', state);
				}
			}
		}
	}

	agentMain(state){
		sleep(1000);

		console.log('Main state', state);

		if(this.state.subjects.length===0){
			this.agentSpeak('준비중...', 0);
		} else if(state===0){
			if(!firebase.apps.length) {
				this.agent = firebase.initializeApp(firebaseConfig);
			} else {
				this.agent = firebase.app();
			}
			this.agentMain(1);
		} else if(typeof this.state.questions[this.state.counter]==='undefined'){
			// Finish all
			this.setState({
				counter:this.state.counter + 1,
			});
			document.getElementById('the-title').innerHTML = '감사합니당';
			this.agentSpeak('감사합니당', 0);
		} else if(this.state.questions[this.state.counter]===''){
			document.getElementById('next-div').style.visibility = "hidden";
			document.getElementById('confirmation-div').style.visibility = "hidden";
			// Change of subject
			document.getElementById('the-title').innerHTML = '(문제설명 하는 중)'; 
			subject_counter += 1;
			question_counter = 1;
			this.agentSpeak(this.state.subjects[this.state.counter], 0) 
			this.setState({
				counter:this.state.counter + 1,
			});
		} else if(state===1) {
			document.getElementById('next-div').style.visibility = "hidden";
			document.getElementById('confirmation-div').style.visibility = "hidden";
			// Start with the questions
			document.getElementById('the-title').innerHTML = "상황: " + subject_counter + " / 5 " +
															 "(" + all_subjects[subject_counter-1] + ")" +
															 " | 문제: " + question_counter + " / 5 ";
			sleep(1000);
			this.agentSpeak("문제 " + this.state.c_question +" 번 입니다.", 1)
		} else if(state===2){
			// Listening the questions
			this.agentListen(2);
		} else if(state===3) {
			// Confirm Answer
			//document.getElementById('conf-p').innerHTML = "네 / 아니오 로 대답해주세요."
			document.getElementById('confirmation-div').style.visibility = "visible";
			this.agentListen(3);

		} else if(state===4) {
			sleep(3000);
			// Confirm Question			
			this.agentSpeak(this.state.subjects[this.state.counter] + "는?", 5);

		} else if (state===5){			
			this.agentListen(5);

		}else if(state===6){
			// Next question
			//document.getElementById('conf-p').innerHTML = "정답입니다.<br> 다음 문제로 넘어갈까요?"
			document.getElementById('confirmation-div').style.visibility = "visible";
			document.getElementById('next-div').style.visibility = "visible";
			this.agentSpeak("정답입니다.다음 문제로 넘어갈까요?", 6);
		}
	}

	confirmAnswer(){
		document.getElementById('interim').innerHTML = '';
		document.getElementById('final').innerHTML = '';
		document.getElementById('confirmation-div').style.visibility = "hidden";
		//state = 4;
		// counter += 1;
		this.agentSpeak("정답은 " + this.state.answers[this.state.counter] + "입니다." 
			+ this.state.explanations[this.state.counter], 4);

	}

	writeUserData(){
		console.log(this.state.username)
		// this.writeUserData(
		// 	this.state.username,
		// 	"Q:" + String(this.state.c_question), 
		// 	this.state.user_full_answer, 
		// 	this.state.keyword_extraction,
		// );

		firebase.database().ref('user_log/' + this.state.username + 
								'/Q:' + String(this.state.c_question)).set({
			answer: this.state.user_full_answer,
			keyword: this.state.keyword_extraction
		});

	}

	// writeUserData(user_name, question_id, answer, keyword) {
	// 	firebase.database().ref('user_log/' + user_name + '/' + question_id).set({
	// 		answer: answer,
	// 		keyword: keyword
	// 	});
	// }

	repeatQuestion(){
		//this.confirmQuestion();
		document.getElementById('interim').innerHTML = '';
		document.getElementById('final').innerHTML = '';
		document.getElementById('confirmation-div').style.visibility = "hidden";
		let c = this.state.counter;
		this.agentSpeak(this.state.questions[c] + '    ' +
							"첫 번째     :     " + this.state.answer_a[c] + ',                                     ' +
							"            두 번째     :     " + this.state.answer_b[c], 2);

	}

	nextQuestion(){
		this.setState({
			c_question:this.state.c_question + 1,
			counter:this.state.counter + 1,
		});
		question_counter += 1;
		document.getElementById('final').innerHTML = '';
		//document.getElementById('next-div').style.visibility = "hidden";
		window.speechSynthesis.cancel();

		sleep(1000);
		this.agentMain(1);
	}

	startHoiHoi(){
		console.log(START)
		if(START===false){
			sleep(2000);
			START = true;
			document.getElementById('interim').innerHTML = '';
			document.getElementById('final').innerHTML = '';
			// document.getElementById('the-title').innerHTML = '(문제설명 하는 중)';    
			//state = 1;
			this.setState({
				c_question: 1,
				counter: 0,
			});
			window.speechSynthesis.cancel();
			this.agentMain(0);
		}
	}

	render() {
		username = this.props.location.state.userid
		return (     
			<div style={ container }>
				<h1 id='the-title'>준비가 되면 아래 원숭이를 클릭해주세요. </h1>
				{/*<p id='questions'></p>*/}

				<button id="microphone-btn" style={ start_button } onClick={ this.startHoiHoi }>
					<img id="microphone-img" src='emoji_1.png' alt="" />
				</button>
				<div id='question-show' style={ question_show }></div>

				<div id='explanation-show' style={ explanation_show }></div>

{				<div id="next-div" style={ next_button }>
					<p style={{ margin:'0 0 0 0' }}>정답입니다.<br /> 다음 문제로 넘어갈까요?</p>
				</div>   }
				<div id="confirmation-div" style={ hidden_div }>
{/*					<button id="hidden-btn" style={{ margin:'0 20px' }} 
							onClick={ this.confirmAnswer }>네</button>
					<button id="hidden-btn" style={{ margin:'0 20px'}} 
							onClick={ this.repeatQuestion }>아니요</button>*/}
					<p id="conf-p" style={{ fontSize:'30px' }}>네 / 아니오 로 대답해주세요.</p>
				</div>  
				
				<div id="listen-box" style={ listen_box }>
					<p id="confirm-question" style={{ visibility:'hidden' }}></p>
					<p id="listening" style={ listen_text }>대답해 주세요</p>
					<div id='interim' style={ interim }></div>
					<div id='final' style={ final }></div>
					<p id='chances'></p>
				</div>	

			</div>	
		)
	}

}

export default withRouter(Agent);


const styles = {
	container: {
		display: 'flex',
		//position: 'relative',
		flexDirection: 'column',
		alignItems: 'center',
		textAlign: 'center',
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
	listen_box: {
		width:'100%',
		display: 'flex',
		flexDirection: 'column',
		//position: 'absolute',
		//margin:'5px 0',
		justifyContent:'center',
		textAlign:'center',
		alignItems: 'center',

	},
	listen_text: {
		//width:'100%',
		justifyContent:'center',
		textAlign:'center',
		alignItems: 'center',
		visibility:'hidden', 
		margin:'10px 0 10px 0', 
		fontSize:'20px',
		fontWeight:'bold',
		color: '#777',
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
		color: 'black',
		border: '#ccc 1px solid',
		padding: '1em',
		margin: '1em',
		width: '300px',
		visibility: 'hidden'
	},
	hidden_div: {   
		//position:'absolute',
		width: '100%',
		justifyContent:'center',
		textAlign:'center',
		visibility:'hidden',
	},
	next_button: {
		//position:'absolute',
		width: '100%',
		height: '100%',
		margin:'0 0 0 0',
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

const { container, start_button, hidden_div, 
		interim, final, next_button, question_show, 
		explanation_show, listen_box, listen_text } = styles