"use client"

import { useEffect, useState } from "react"
import { Zap, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

type Cell = {
    row: number
    col: number
    mine: boolean
    revealed: boolean
    flagged: boolean
    adjacent: number
}

const ROWS = 8
const COLS = 8
const MINES = 10

function makeEmptyBoard() {
    const b: Cell[][] = []
    for (let r = 0; r < ROWS; r++) {
        const row: Cell[] = []
        for (let c = 0; c < COLS; c++) {
            row.push({ row: r, col: c, mine: false, revealed: false, flagged: false, adjacent: 0 })
        }
        b.push(row)
    }
    return b
}

function plantMines(board: Cell[][], seed = Date.now()) {
    const flat = board.flat()
    let placed = 0
    while (placed < MINES) {
        const idx = Math.floor(Math.random() * flat.length)
        if (!flat[idx].mine) {
            flat[idx].mine = true
            placed++
        }
    }
    // compute adjacent counts
    for (const cell of flat) {
        const neighbors = getNeighbors(board, cell.row, cell.col)
        cell.adjacent = neighbors.filter(n => n.mine).length
    }
    return board
}

function getNeighbors(board: Cell[][], row: number, col: number) {
    const res: Cell[] = []
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const r = row + dr
            const c = col + dc
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) res.push(board[r][c])
        }
    }
    return res
}

export default function Buscaminas() {
    const [board, setBoard] = useState<Cell[][]>(() => makeEmptyBoard())
    const [minesLeft, setMinesLeft] = useState(MINES)
    const [status, setStatus] = useState<"idle" | "playing" | "lost" | "won">("idle")

    useEffect(() => {
        // start a fresh game on mount
        reset()
    }, [])

    function reset() {
        const b = makeEmptyBoard()
        plantMines(b)
        setBoard(b)
        setMinesLeft(MINES)
        setStatus("playing")
    }

    function revealCell(r: number, c: number) {
        if (status !== "playing") return
        const b = board.map(row => row.map(cell => ({ ...cell })))
        const cell = b[r][c]
        if (cell.flagged || cell.revealed) return
        cell.revealed = true
        if (cell.mine) {
            // reveal all
            for (const rr of b) for (const cc of rr) cc.revealed = true
            setBoard(b)
            setStatus("lost")
            return
        }
        if (cell.adjacent === 0) {
            // flood fill
            const stack = [cell]
            while (stack.length) {
                const cur = stack.pop() as Cell
                const neighbors = getNeighbors(b, cur.row, cur.col)
                for (const n of neighbors) {
                    if (!n.revealed && !n.flagged) {
                        n.revealed = true
                        if (n.adjacent === 0) stack.push(n)
                    }
                }
            }
        }
        setBoard(b)
        checkWin(b)
    }

    function toggleFlag(e: React.MouseEvent, r: number, c: number) {
        e.preventDefault()
        if (status !== "playing") return
        const b = board.map(row => row.map(cell => ({ ...cell })))
        const cell = b[r][c]
        if (cell.revealed) return
        cell.flagged = !cell.flagged
        setBoard(b)
        setMinesLeft(MINES - b.flat().filter(x => x.flagged).length)
        checkWin(b)
    }

    function checkWin(b: Cell[][]) {
        const flat = b.flat()
        const unrevealed = flat.filter(c => !c.revealed).length
        if (unrevealed === MINES) {
            setStatus("won")
            // reveal flags
            const copy = b.map(row => row.map(cell => ({ ...cell })))
            for (const c of copy.flat()) if (c.mine) c.flagged = true
            setBoard(copy)
        }
    }

    return (
        <div className="cyber-card">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400">
                    <Zap size={20} />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Buscaminas</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-[12px] font-mono text-zinc-400">Minas: {minesLeft}</div>
                    <button onClick={reset} className="p-1 hover:bg-zinc-800 rounded transition-colors" title="Reiniciar">
                        <RotateCcw size={18} className="text-zinc-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-8 gap-1 justify-center">
                {board.map((row, r) => row.map((cell, c) => (
                    <motion.button
                        key={`${r}-${c}`}
                        onClick={() => revealCell(r, c)}
                        onContextMenu={(e) => toggleFlag(e, r, c)}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 flex items-center justify-center rounded select-none border ${cell.revealed ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950 border-zinc-800'} text-sm font-bold ${cell.revealed ? 'text-white' : 'text-zinc-400'}`}
                    >
                        {cell.revealed ? (
                            cell.mine ? '💣' : (cell.adjacent > 0 ? <span className={`text-${cell.adjacent === 1 ? 'cyan' : cell.adjacent === 2 ? 'green' : 'yellow'}-400`}>{cell.adjacent}</span> : '')
                        ) : (
                            cell.flagged ? '🚩' : ''
                        )}
                    </motion.button>
                )))}
            </div>

            <div className="mt-4 text-[12px] font-mono text-zinc-400">
                {status === 'won' && <div className="text-green-400">Ganaste 🎉</div>}
                {status === 'lost' && <div className="text-red-400">Perdiste — minas detonadas</div>}
                {status === 'playing' && <div>Haz click para descubrir; clic derecho para marcar bandera.</div>}
            </div>
        </div>
    )
}
