import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowClockwise } from '@phosphor-icons/react'
import { ChessBoard, CapturedPieces } from '@/components/ChessComponents'
import { createInitialBoard, getValidMoves, movePiece } from '@/lib/chess-logic'
import type { Board, Piece, PieceColor, Position } from '@/lib/chess-types'

function App() {
  const [board, setBoard] = useState<Board>(createInitialBoard())
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('white')
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([])
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([])

  const handleSquareClick = (row: number, col: number) => {
    const clickedPiece = board[row][col]

    if (selectedSquare) {
      const isValidMove = validMoves.some(
        move => move.row === row && move.col === col
      )

      if (isValidMove) {
        const capturedPiece = board[row][col]
        if (capturedPiece) {
          if (capturedPiece.color === 'white') {
            setCapturedWhite(prev => [...prev, capturedPiece])
          } else {
            setCapturedBlack(prev => [...prev, capturedPiece])
          }
        }

        const newBoard = movePiece(board, selectedSquare, { row, col })
        setBoard(newBoard)
        setSelectedSquare(null)
        setValidMoves([])
        setCurrentTurn(currentTurn === 'white' ? 'black' : 'white')
      } else if (clickedPiece && clickedPiece.color === currentTurn) {
        const moves = getValidMoves(board, { row, col }, clickedPiece)
        setSelectedSquare({ row, col })
        setValidMoves(moves)
      } else {
        setSelectedSquare(null)
        setValidMoves([])
      }
    } else if (clickedPiece && clickedPiece.color === currentTurn) {
      const moves = getValidMoves(board, { row, col }, clickedPiece)
      setSelectedSquare({ row, col })
      setValidMoves(moves)
    }
  }

  const handleReset = () => {
    setBoard(createInitialBoard())
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentTurn('white')
    setCapturedWhite([])
    setCapturedBlack([])
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold mb-2">Chess</h1>
          <p className="text-muted-foreground">Classic strategy game for two players</p>
        </header>

        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-6 items-start">
          <Card className="lg:order-1 order-2">
            <CardHeader>
              <CardTitle className="text-xl">Black</CardTitle>
            </CardHeader>
            <CardContent>
              <CapturedPieces pieces={capturedBlack} color="black" />
            </CardContent>
          </Card>

          <div className="lg:order-2 order-1 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Badge 
                variant={currentTurn === 'white' ? 'default' : 'secondary'}
                className="text-base px-6 py-2"
              >
                {currentTurn === 'white' ? 'White' : 'Black'} to move
              </Badge>
              
              <ChessBoard
                board={board}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                onSquareClick={handleSquareClick}
              />

              <Button 
                onClick={handleReset}
                variant="outline"
                className="gap-2"
              >
                <ArrowClockwise size={20} />
                New Game
              </Button>
            </div>
          </div>

          <Card className="lg:order-3 order-3">
            <CardHeader>
              <CardTitle className="text-xl">White</CardTitle>
            </CardHeader>
            <CardContent>
              <CapturedPieces pieces={capturedWhite} color="white" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App