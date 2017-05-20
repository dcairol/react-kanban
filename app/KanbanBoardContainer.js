'use strict';

import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import 'whatwg-fetch';
import KanbanBoard from './KanbanBoard';
import update from 'react-addons-update';

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
	'Content-Type': 'application/json',
	Authorization: 'dcairol'
};

class KanbanBoardContainer extends Component {
	constructor(){
		super(...arguments);
		this.state = {
			cards: []
		};
	}

	getCardIndex(cardId){
		return this.state.cards.findIndex(c => c.id === cardId);
	}

	getCard(cardId){
		return this.state.cards.find(c => c.id === cardId);
	}

	maxTaskId(cardId){
		const card = this.getCard(cardId);
		let max = 0;
		for (let task of card.tasks){
			max = ((task.id > max) && task.id) || max;
		}
		return max;
	}

	nextTaskId(cardId){
		return this.maxTaskId(cardId) + 1;
	}

	revertStateIfNeeded(fn){
		const state = this.state;
		return fn()
		.catch(e => {
			console.error(`Server error ${e.message}`);
			this.setState(state);
		})
	}

	addTask(cardId, taskName){
		const cardIndex = this.getCardIndex(cardId);
		const taskId = this.nextTaskId(cardId);
		const newTask = { name: taskName, done: false, id: taskId };
		const newState = update(this.state.cards, {
			[cardIndex]: {
				tasks: {
					$push: [newTask]
				}
			}
		});
		return this.revertStateIfNeeded(() => {
			this.setState({ cards: newState });
			return this.addTaskInServer(cardId, newTask)
			.then(r => r.json())
			.then(body => {
				newTask.id = body.id;
				this.setState({ cards: newState });
			});
		});
	}

	addTaskInServer(cardId, newTask){
		return this.apiCallPost(`cards/${cardId}/tasks`, newTask);
	}

	deleteTask(cardId, taskId, taskIndex){
		const cardIndex = this.getCardIndex(cardId);
		const newState = update(this.state.cards, {
			[cardIndex]: {
				tasks: {
					$splice: [[taskIndex, 1]]
				}
			}
		});
		return this.revertStateIfNeeded(() => {
			this.setState({ cards: newState });
			return this.deleteTaskInServer(cardId, taskId);
		});
	}

	deleteTaskInServer(cardId, taskId){
		const path = `cards/${cardId}/tasks/${taskId}`;
		return this.apiCallDelete(path);
	}

	toggleTask(cardId, taskId, taskIndex){
		const cardIndex = this.getCardIndex(cardId);
		const newDone = !this.state.cards[cardIndex].tasks[taskIndex].done;
		const newState = update(this.state.cards, { [cardIndex]: { tasks: {[taskIndex]: { done: { $set: newDone } } } }});

		return this.revertStateIfNeeded(() => {
			this.setState({ cards: newState });
			return this.toggleTaskInServer(cardId, taskId, { done: newDone });
		});
	}

	toggleTaskInServer(cardId, taskId, body){
		const path = `cards/${cardId}/tasks/${taskId}`;
		return this.apiCallPut(path, body);
	};

	apiCall(path, method, body){
		const URL = `${API_URL}/${path}`;
		const headers = API_HEADERS;
		const data = { headers };
		data.method = method || 'get';
		if (body) data.body = JSON.stringify(body);
		return fetch(URL, data)
		.then(r => {
			return r.ok ? r : Promise.reject(new Error('Server sync failed'));
		});
	}

	apiCallGet(path){
		return this.apiCall(path)
		.then(data => data.json());
	}

	apiCallDelete(path){
		return this.apiCall(path, 'delete');
	}

	apiCallPost(path, body){
		return this.apiCall(path, 'post', body);
	}

	apiCallPut(path, body){
		return this.apiCall(path, 'put', body);
	}

	componentDidMount(){
		return this.apiCallGet('cards')
		.then(cards => {
			this.setState({ cards });
		})
		.catch(err => console.error(err.message));
	}

	render(){
		return <KanbanBoard cards = {this.state.cards} taskCallbacks={{ addTask: this.addTask.bind(this), deleteTask: this.deleteTask.bind(this), toggleTask: this.toggleTask.bind(this)}} />;
	}
}

export default KanbanBoardContainer;
