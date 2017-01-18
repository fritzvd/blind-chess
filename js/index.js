/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var game;
var stockfish;
var board;
var skill;

function newGame () {
  game = new Chess();
  board = ChessBoard('board', game.fen());
  stockfish = new STOCKFISH();
  updatePgn(game.pgn());
  stockfish.onmessage = function (e) {
    var match = e.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
    if(match) {
      game.move({from: match[1], to: match[2], promotion: match[3]});
      updatePgn(game.pgn());
    }
  }
}

function updatePgn (pgn) {
  document.querySelector('#pgn').innerHTML = pgn;
  if (board) {
    board = ChessBoard('board', game.fen());
  }
}

function adjustSkill (skill) {
  stockfish.postMessage('setoption name Skill Level value ' + skill);
}

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.querySelector('#board').classList.toggle('hidden')

        newGame();
        stockfish.postMessage('uci')
        skill = 0
        stockfish.postMessage('setoption name Skill Level value ' + skill);
        $('#dif-label').html("difficulty: " + skill)

        function resetInput() {
          var input = $('#move-input');
          input.val('');
          input.attr('placeholder', 'Enter your next move');
          input.removeClass('invalid');
        }

        function addMove (e) {
          var newMove = $('#move-input').val();
          var moved = game.move(newMove);
          updatePgn(game.pgn());
          if (moved) {
            console.log(newMove, game.ascii())
            stockfish.postMessage('position fen ' + game.fen())
            stockfish.postMessage('eval')
            stockfish.postMessage('go depth 1')
            stockfish.postMessage('eval')
            resetInput();
          } else {
            console.log(newMove, 'was illegal');
            illegalMove();
          }
          board = ChessBoard('board', game.fen());
        }

        function illegalMove () {
          var input = $('#move-input');
          input.val('');
          input.addClass('invalid');
          input.attr('placeholder', 'Invalid move, try again!');

          setTimeout(resetInput, 3000);
        }

        $('#add-move').click(addMove)

        $("#move-input").on('keyup', function (e) {
          if (e.keyCode == 13) {
            addMove(e);
          }
        });


        $('#new-game').click(newGame)
        $('#show-board').click(function () {
          if (!board) {
            board = ChessBoard('board', game.fen());
          }
          document.querySelector('#board').classList.toggle('hidden')
        })
        $('#difficulty').change(function (e) {
          $('#dif-label').html("difficulty: " + e.target.value)
          adjustSkill(e.target.value)
        })
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Ontvangen Event: ' + id);
    }
};

app.initialize();
