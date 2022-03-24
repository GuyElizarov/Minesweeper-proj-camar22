'use strict'

const BOMB = '💣'
const FLAG = '🚩'
const NORMAL = '😃'
const LOST = '🤯'
const WIN = '😎'
const LIVE = '❤️'

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gGame

function initGame() {
    reset()
    gBoard = buildBoard()
    renderBoard(gBoard)
    renderLevelsBtns()
    gGame.isOn = true
    console.log('gBoard', gBoard)

    window.addEventListener("contextmenu", e => e.preventDefault()); //  hide the context menu on right click
}

function buildBoard() {
    var board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false,
                coords: { i, j }
            }
            board[i][j] = cell
        }
    }
    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine) continue
            var mineCount = countMinesNegs(i, j, board)
            if (mineCount > 0) {
                cell.minesAroundCount = mineCount
            }
        }
    }
}

function countMinesNegs(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}


function renderBoard(board) {
    var strHTML = '';

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `\t<td  data-i="${i}" data-j="${j}" oncontextmenu="cellMarked(this, ${i}, ${j})"
            onclick="cellClicked(this, ${i}, ${j})"  ></td>\n`
        }
        strHTML += `</tr>\n`
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {

    if (gGame.isFirstClick) {
        setBombsRandomly(gBoard, gLevel.MINES, i, j)
        setMinesNegsCount(gBoard)
        gGame.isFirstClick = false
    }

    if (gGame.isOn) {

        if (!gGame.secsPassed) startTimer()

        var cell = gBoard[i][j]

        if (cell.isMarked) return
        if (cell.isShown) return

        if (cell.isMine && !gGame.liveCount) {
            stopTimer()
            revealAllMines()
            gGame.isOn = false
        } else if (cell.isMine) {
            elCell.innerHTML = BOMB
            decreaseFife()
        }

        if (cell.minesAroundCount) {
            cell.isShown = true
            gGame.shownCount++
                elCell.innerHTML = cell.minesAroundCount
            elCell.classList.add('is-shown')
        }

        if (!cell.minesAroundCount && !cell.isMine) {
            cell.isShown = true
            gGame.shownCount++
                elCell.classList.add('is-shown')
            expandShown(i, j)
        }

        checkGameOver()
    }
}

function cellMarked(elCell, i, j) {

    if (gGame.isFirstClick) {

        console.log('heloo');
        setBombsRandomly(gBoard, gLevel.MINES, i, j)
        setMinesNegsCount(gBoard)
        gGame.isFirstClick = false
    }

    if (gGame.isOn) {

        if (!gGame.secsPassed) startTimer()
        var cell = gBoard[i][j]
        if (cell.isShown) return

        if (!cell.isMarked) {
            elCell.innerText = FLAG
            cell.isMarked = true
            gGame.markedCount++
        } else if (cell.isMarked) {
            elCell.innerText = ''
            cell.isMarked = false
            gGame.markedCount--
        }
        checkGameOver()
    }
}

function checkGameOver() {
    var reqMarked = gLevel.MINES
    var reqShown = gLevel.SIZE ** 2 - gLevel.MINES
    if (reqMarked === gGame.markedCount && reqShown === gGame.shownCount) {
        stopTimer()
        gGame.isOn = false
        console.log('game over');
        var elSmiley = document.querySelector('.smiley-container')
        elSmiley.innerText = WIN
    }
}


function setBombsRandomly(board, mines, currI, currJ) {
    for (var i = 0; i < mines; i++) {
        var cell = getEmptyCell(board)
        if (cell.coords.i === currI && cell.coords.j === currJ) {
            i--
            continue
        }
        cell.isMine = true
        var elCell = document.querySelector(`[data-i="${cell.coords.i}"][data-j="${cell.coords.j}"]`)
        elCell.classList.add('hidden-bomb')
    }
}

function getEmptyCell(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine) emptyCells.push(currCell)
        }
    }
    var randomIdx = getRandomIntExclusive(0, emptyCells.length)
    return emptyCells[randomIdx]
}

function revealAllMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var elCell = document.querySelector('.hidden-bomb')
        elCell.innerText = BOMB
        elCell.classList.remove('hidden-bomb')
        elCell.classList.add('explosion')
    }
    var elSmiley = document.querySelector('.smiley-container')
    elSmiley.innerText = LOST
    console.log('boom boom');
}

function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;

            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            var cell = gBoard[i][j]

            if (cell.minesAroundCount) {
                if (!cell.isShown) {
                    cell.isShown = true
                    gGame.shownCount++
                        elCell.innerHTML = cell.minesAroundCount
                    elCell.classList.add('is-shown')
                }
            } else if (!cell.minesAroundCount && !cell.isMine) {
                if (!cell.isShown) {
                    cell.isShown = true
                    gGame.shownCount++
                        elCell.classList.add('is-shown')
                    expandShown(i, j)
                }
            }
        }
    }
}


function renderLevelsBtns() {
    var strHTML = ''
    var opts = ['Beginner', 'Medium', 'Expert']
    for (var i = 0; i < opts.length; i++) {
        strHTML += `<button onclick="changeLevel('${opts[i]}')">${opts[i]}</button>`
    }
    var elBtnContainer = document.querySelector('.btn-container')
    elBtnContainer.innerHTML = strHTML
}

function changeLevel(levelStr) {
    switch (levelStr) {
        case 'Beginner':
            gLevel = {
                SIZE: 4,
                MINES: 2
            };
            break
        case 'Medium':
            gLevel = {
                SIZE: 8,
                MINES: 12
            };
            break
        case 'Expert':
            gLevel = {
                SIZE: 12,
                MINES: 30
            };
            break
    }
    initGame()
}

function reset() {
    resetTimer()
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isFirstClick: true,
        liveCount: 3
    }
    var elSmiley = document.querySelector('.smiley-container')
    elSmiley.innerText = NORMAL

    var elLive = document.querySelector('.lives-container')
    elLive.innerText = LIVE + LIVE + LIVE
}

function decreaseFife() {
    gGame.liveCount--
        var lives = ''
    for (var i = 0; i < gGame.liveCount; i++) {
        lives += LIVE
    }
    console.log(lives, 'lives');
    var elLives = document.querySelector('.lives-container')
    elLives.innerText = lives
}