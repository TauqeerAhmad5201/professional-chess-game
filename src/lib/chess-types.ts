export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
export type PieceColor = 'white' | 'black'

export interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

export interface Position {
  row: number
  col: number
}

export type Board = (Piece | null)[][]

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
}
