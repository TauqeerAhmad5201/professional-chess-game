import type { Board, Piece, Position, PieceColor } from './chess-types'

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))

  const backRow: Piece['type'][] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: 'black' }
    board[1][col] = { type: 'pawn', color: 'black' }
    board[6][col] = { type: 'pawn', color: 'white' }
    board[7][col] = { type: backRow[col], color: 'white' }
  }

  return board
}

export function getValidMoves(board: Board, from: Position, piece: Piece): Position[] {
  const moves: Position[] = []
  const { row, col } = from
  const { type, color } = piece

  switch (type) {
    case 'pawn':
      return getPawnMoves(board, from, color)
    case 'rook':
      return getRookMoves(board, from, color)
    case 'bishop':
      return getBishopMoves(board, from, color)
    case 'queen':
      return getQueenMoves(board, from, color)
    case 'king':
      return getKingMoves(board, from, color)
    case 'knight':
      return getKnightMoves(board, from, color)
  }

  return moves
}

function getPawnMoves(board: Board, from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const { row, col } = from
  const direction = color === 'white' ? -1 : 1
  const startRow = color === 'white' ? 6 : 1

  const forward = row + direction
  if (forward >= 0 && forward < 8 && !board[forward][col]) {
    moves.push({ row: forward, col })

    if (row === startRow) {
      const doubleForward = row + direction * 2
      if (!board[doubleForward][col]) {
        moves.push({ row: doubleForward, col })
      }
    }
  }

  for (const dcol of [-1, 1]) {
    const newCol = col + dcol
    if (forward >= 0 && forward < 8 && newCol >= 0 && newCol < 8) {
      const target = board[forward][newCol]
      if (target && target.color !== color) {
        moves.push({ row: forward, col: newCol })
      }
    }
  }

  return moves
}

function getRookMoves(board: Board, from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  for (const [dr, dc] of directions) {
    let r = from.row + dr
    let c = from.col + dc

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c]
      if (!target) {
        moves.push({ row: r, col: c })
      } else {
        if (target.color !== color) {
          moves.push({ row: r, col: c })
        }
        break
      }
      r += dr
      c += dc
    }
  }

  return moves
}

function getBishopMoves(board: Board, from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

  for (const [dr, dc] of directions) {
    let r = from.row + dr
    let c = from.col + dc

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c]
      if (!target) {
        moves.push({ row: r, col: c })
      } else {
        if (target.color !== color) {
          moves.push({ row: r, col: c })
        }
        break
      }
      r += dr
      c += dc
    }
  }

  return moves
}

function getQueenMoves(board: Board, from: Position, color: PieceColor): Position[] {
  return [...getRookMoves(board, from, color), ...getBishopMoves(board, from, color)]
}

function getKingMoves(board: Board, from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

  for (const [dr, dc] of directions) {
    const r = from.row + dr
    const c = from.col + dc

    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c]
      if (!target || target.color !== color) {
        moves.push({ row: r, col: c })
      }
    }
  }

  return moves
}

function getKnightMoves(board: Board, from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]

  for (const [dr, dc] of offsets) {
    const r = from.row + dr
    const c = from.col + dc

    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c]
      if (!target || target.color !== color) {
        moves.push({ row: r, col: c })
      }
    }
  }

  return moves
}

export function movePiece(board: Board, from: Position, to: Position): Board {
  const newBoard = board.map(row => [...row])
  const piece = newBoard[from.row][from.col]
  
  if (piece) {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null
  }

  return newBoard
}
