import React, { useEffect, useState } from 'react';
import questions from '../data/questions.json';

// Number of questions in the dataset
const MAX_NUM_QUESTIONS = 220;

function validateNumQs(n) {
	return Number.isInteger(n) && n > 0 && n <= MAX_NUM_QUESTIONS;
}


// Number of questions on SAT as of Sep. 2025
const DEFAULT_NUM_QUESTIONS = 44;

function Start(props) {
	const [numQs, setNumQs] = useState(DEFAULT_NUM_QUESTIONS)

	// whether timer is running or not. setup/running/paused/review
	const [gameState, setGameState] = useState("setup")
	const [currentQ, setCurrentQ] = useState(0)

	const [currentNotes, setNotes] = useState("")

	const [showAnswer, setShowAnswer] = useState(false)
	
	const handleChange = (e) => {
		let val = Number(e.target.value)
		if (validateNumQs(val)) {
			setNumQs(val)
			return
		}

		setNumQs(DEFAULT_NUM_QUESTIONS)
	}

	const [idxs, setIdxs] = useState( Array.from({length: MAX_NUM_QUESTIONS}, (_, i) => i) )

	const start = () => {
		for (let q of questions) {
			q.notes = ""
		}
		
		let newIdxs = idxs
			.map(val => ({ val, sort: Math.random() }))
			.sort((a,b) => a.sort - b.sort)
			.map(({ val }) => val)

		setIdxs(newIdxs)
		setGameState("running")
		setNotes("")
		setCurrentQ(0)
	}

	const nextQ = () => {
		const idx = idxs[currentQ]

		questions[idx].notes = currentNotes
		
		setNotes("")
		setShowAnswer(false)

		if (currentQ + 1 >= numQs) {
			if (gameState == "review") {
				setGameState("finished")
				return;
			}

			setGameState("review")
			setCurrentQ(0)
			return;
		}

		setCurrentQ(currentQ + 1)
	}


	useEffect(() => {
		// note, setting a key prop on nodes containing tex expressions is necessary for proper rendering
		window.MathJax.typeset()

		let q = questions[idxs[currentQ]]
		if (q.notes) {
			setNotes(q.notes)
		}
	}, [gameState, currentQ, showAnswer])

	const idx = idxs[currentQ]
	const question = questions[idx]

	return (
		<div class="game-container">
			{( gameState == "setup" &&
				<div class="setup">
					<label> Number of questions (1-220) </label>
					<input
						id="num-questions"
						type="number"
						min="1"
						step="1"
						value={numQs}
						onChange={handleChange}
					/>
					<button onClick={start}>
						Start
					</button>
				</div>
			)}

			{gameState == "review" &&
				<div class="review-marker">
					Review
				</div>
			}

			{( (gameState == "running" || gameState == "review") &&
				<div key={question.id} class="question-container">
					<div class="question-header"> Question #{ question.id } ({currentQ + 1}/{numQs}) </div>
					<div class="question-text"> { question.query } </div>
					<div class="answer-choices">
						{ question.choices.map((choice) => (<div class="choice"> {choice} </div>)) }
					</div>
					
					<div class="notes">
						<label> Notes </label>
						<textarea value={currentNotes} onChange={e => setNotes(e.target.value)} readOnly={gameState == "review"} />
					</div>
					

					{(gameState == "review" || showAnswer) && <div class="correct-answer"> Answer: { question.choices[question.gold] } </div>}
	
					<div class="question-buttons">
					<div class="next-question">
						<button onClick={nextQ}>
							Next
						</button>
					</div>

	

					{ !showAnswer && gameState != "review" && 
						<div class="show-answer">
							<button onClick={() => setShowAnswer(true)}> Show Answer </button>
						</div> }
					</div>
					
				</div>
			)}


			{gameState == "finished" && 
				<div class="end-screen">
					<div class="finished">
						Finished Review
					</div>
					<div class="start-over">
						<button onClick={() => setGameState("setup")}> Start Over </button>
					</div>
				</div>
			}
		</div>
	);
}

export default Start;
