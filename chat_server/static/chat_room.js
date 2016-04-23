window.onbeforeunload=function(){
				return force_disconnect();
			};
			console.log("wei");
			
            var namespace = '/test'; // change to an empty string to use the global namespace

            var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);

            var clients_connected = {};
            var justConnected = true; //determines how many new clients we need to add
            var client_username = "";
            // var all_chats_dict = {}; //use this to keep track of chats
            var all_chats_array = []; //use this to parse through / modify
            var chatIndex = 0;


            function searchForChatIndex(listOfChats, targetUser) {
            	for (var i = 0; i < listOfChats.length; i++) {
            		if (targetUser == listOfChats[i].get("to_user")) {
            			return i;
            		}
            	}
            	return -1;
            }

            //adds the new message to the appropriate chat box
            socket.on('message sent', function(msg) {
                var currentChatIndex = searchForChatIndex(all_chats_array, msg["person_chatting"]);
                all_chats_array[currentChatIndex].get("chat").push({"author": msg["from"], "msg": msg["message"]});
                rerenderChatBody(all_chats_array);
                var objDiv = document.getElementById("chatContent");
				objDiv.scrollTop = objDiv.scrollHeight;
            });


            socket.on('make new chat', function(msg) {
            	console.log("request chat from:");
            	console.log(msg["from"]);
            	console.log(msg["to"]);

            	var currentChat = new ChatData({
					cur_user    : msg["to"],
					to_user  : msg["from"],
					chat : []
				});

            	all_chats_array.push(currentChat);
            	rerenderChatBody(all_chats_array);
            });

            socket.on('closing chat', function(msg) {
            	console.log("closing chat request from:");
            	console.log(msg["from"]);

            	var new_chat_array = [];
            	for (var i = 0; i < all_chats_array.length; i++) {
            		console.log(all_chats_array[i].get("to_user"))
            		if (all_chats_array[i].get("to_user") != msg["from"]) {
            			new_chat_array.push(all_chats_array[i]);
            		}
            	}
            	all_chats_array = new_chat_array;
            	rerenderChatBody(all_chats_array);
            });


            socket.on('new client', function(msg) {
               clients_connected = msg["all_clients"];
               var newClients = [];
               for (var key in msg["all_clients"]) {
               		newClients.push(key);
               }
               renderClientDropDown(newClients);
            });

            var ClientDropdown = React.createClass({
            	changeHandler: function(e) {
        			var v = (e.target.value).toString();
        			if (v != client_username) {
        				if (searchForChatIndex(all_chats_array, v) == -1) {
        					start_new_chat(client_username, v);
        				}
        			}
    			},
            	render: function() {
            		var clients = this.props.data.map(function(client_name) {
            			if (client_name == client_username) {
              				return (
            				<option value={client_name} selected> {client_name} </option>
            				);          				
            			} else {
             				return (
            					<option value={client_name}> {client_name} </option>
            				);           				
            			}

            		});
            		return (
            			<div>
            			<p id="startConvoText">Start a convo:</p>
            			<select id="clientSelect" name="clientSelect" onChange={this.changeHandler}>
            			{clients}
            			</select>
            			</div>
            		);
            	}
            });

            function renderClientDropDown(clientData){
                ReactDOM.render(
           			 <ClientDropdown data={clientData} />, 
            		document.getElementById('clients_div')
            		)	
            }

            function force_disconnect() {
            	socket.emit('disconnect request', {data:client_username});
            }

            function sendMessage(msg, from, to) {
            	socket.emit('send message', {data:msg, f: from, t: to});
            }

            function start_new_chat(to, from) {
            	console.log("starting new chat...");
            	console.log(to);
            	console.log(from);
            	socket.emit('create new chat', {f: from, t: to});
            }

            function close_chat(to, from) {
            	console.log("closing chat...");
            	console.log(to);
            	console.log(from);
            	socket.emit('close chat', {f: from, t: to});

            }

			var ChatData = Backbone.Model.extend({
				defaults : {
				cur_user : null,
				to_user  : null,
				chat : null //this should be a list of strings?
				}
			});
			  

			//this data takes in a dictionary with {author: "", msg: ""}
			var Chat = React.createClass({
				render: function() {
					return (
						<p>{this.props.data["author"]}: {this.props.data["msg"]}</p>
					);					
				}
			});

			//this data takes in a list of subChats as described above
			var ChatDialogue = React.createClass({
				render: function() {
				var chatNodes = this.props.data.map (function (subChat) {
					return (
						<Chat data={subChat} />
					);
				});
				return (
					<div className="chatContent" id="chatContent">
					{chatNodes}
					</div>
					);
				}
			});

			var CommentForm = React.createClass({
			  getInitialState: function() {
				return {text: ''};
			  },
			  handleTextChange: function(e) {
				this.setState({text: e.target.value});
			  },
			  handleSubmit: function(e) {
			  	e.preventDefault();
			  	// console.log("this is what you just inputed");
			  	// console.log(this.state.text.trim());
			  	sendMessage(this.state.text.trim(), this.props.from, this.props.to);
			  	this.setState({text: ''});
			  },
			  render: function() {
				return (
				  <form className="commentForm" onSubmit={this.handleSubmit}>
					<input
					className="textInput"
					type="text"
					placeholder="Say something..."
					value={this.state.text}
					onChange={this.handleTextChange} />
					<input type="submit" value="Post" className="submitInput"/>
				  </form>
				);
			  }
			});

			var ChatBox = React.createClass({
				handleClick: function(e) {
					console.log("weee");
					close_chat(this.props.data.attributes["to_user"], this.props.data.attributes["cur_user"]);
				},
				render: function() {
					// console.log(this.props.data);
					var attribute_data = this.props.data.attributes;
					var fromUser = attribute_data["cur_user"]
					var currentUser = attribute_data["to_user"];
					var currentMessages = attribute_data["chat"];

					return (
						<div className="chatWrapper">
							<div className="usernameWrapper">
								<h2 className="usernameHeader">
									{currentUser}
								</h2>
								<a href="#" className="closeChat" onClick={this.handleClick}>x</a>
							</div>
							<ChatDialogue data={currentMessages} />
							<CommentForm from={fromUser} to={currentUser} />
						</div>
					);
				}
			});

			var ChatBody = React.createClass({
				render: function() {
					var ChatBoxNode = this.props.data.map(function (subChatBox) {
						// console.log(subChatBox)
						return (
							<ChatBox data={subChatBox} />
						);
					});
					return (
						<div className="chatContainer">
							{ChatBoxNode}
						</div>
					);
				}
			});

			var loggedIn = false;


            $('form#emit').submit(function(event) {
            	if (!loggedIn) {
            		if(clients_connected[$('#emit_data').val()] == undefined) {
                		socket.emit('register', {data: $('#emit_data').val()});
                		initialRender($('#emit_data').val());
                		loggedIn = true;            			
            		}else {
            			alert("user already logged in!");
            		}
	
            	}
            return false;
            });

            function rerenderChatBody(input_data) {
     			ReactDOM.render(
				<ChatBody data={input_data} />,
				document.getElementById('content')
				)
            }

            function initialRender(input_username) {
            	client_username = input_username;
     			ReactDOM.render(
				<ChatBody data={[]} />,
				document.getElementById('content')
				)
				var user_header = document.getElementById('username');
    
    			user_header.removeChild(user_header.childNodes[0]);

    			// user_header.appendChild(document.createTextNode(input_username));
    			var submitButtonDiv = document.getElementById('username_submit');
    			submitButtonDiv.removeChild(submitButtonDiv.childNodes[0]);
            }