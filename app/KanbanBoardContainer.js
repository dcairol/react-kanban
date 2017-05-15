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
		})
		this.setState({ cards: newState });
		this.addTaskInServer(cardId, newTask);
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
		this.setState({ cards: newState });
		this.deleteTaskInServer(cardId, taskId);
	}

	deleteTaskInServer(cardId, taskId){
		const path = `cards/${cardId}/tasks/${taskId}`;
		return this.apiCallDelete(path);
	}

	toggleTask(cardId, taskId, taskIndex){

	}

	apiCall(path, method, body){
		const URL = `${API_URL}/${path}`;
		const headers = API_HEADERS;
		const data = { headers };
		data.method = method || 'get';
		if (body) data.body = JSON.stringify(body);
		return fetch(URL, data);
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
