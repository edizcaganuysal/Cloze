'use client'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { createNoise2D } from 'simplex-noise'

interface Point {
    x: number
    y: number
    wave: { x: number; y: number }
    cursor: {
        x: number
        y: number
        vx: number
        vy: number
    }
}

interface WavesProps {
    className?: string
    strokeColor?: string
    backgroundColor?: string
    pointerSize?: number
}

export function Waves({
    className = "",
    strokeColor = "#ffffff",
    backgroundColor = "#000000",
    pointerSize = 0.5
}: WavesProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)
    const mouseRef = useRef({
        x: -10,
        y: 0,
        lx: 0,
        ly: 0,
        sx: 0,
        sy: 0,
        v: 0,
        vs: 0,
        a: 0,
        set: false,
    })
    const pathsRef = useRef<SVGPathElement[]>([])
    const linesRef = useRef<Point[][]>([])
    const noiseRef = useRef<((x: number, y: number) => number) | null>(null)
    const rafRef = useRef<number | null>(null)
    const boundingRef = useRef<DOMRect | null>(null)

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return

        noiseRef.current = createNoise2D()

        setSize()
        setLines()

        window.addEventListener('resize', onResize)
        window.addEventListener('mousemove', onMouseMove, { passive: true })
        containerRef.current.addEventListener('touchmove', onTouchMove, { passive: false })

        rafRef.current = requestAnimationFrame(tick)

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            window.removeEventListener('resize', onResize)
            window.removeEventListener('mousemove', onMouseMove)
            containerRef.current?.removeEventListener('touchmove', onTouchMove)
        }
    }, [])

    const setSize = () => {
        if (!containerRef.current || !svgRef.current) return

        boundingRef.current = containerRef.current.getBoundingClientRect()
        const { width, height } = boundingRef.current

        svgRef.current.style.width = `${width}px`
        svgRef.current.style.height = `${height}px`
    }

    const setLines = () => {
        if (!svgRef.current || !boundingRef.current) return

        const { width, height } = boundingRef.current
        linesRef.current = []

        pathsRef.current.forEach(path => {
            path.remove()
        })
        pathsRef.current = []

        // Wider gaps = fewer points = better perf
        const xGap = 10
        const yGap = 10

        const oWidth = width + 200
        const oHeight = height + 30

        const totalLines = Math.ceil(oWidth / xGap)
        const totalPoints = Math.ceil(oHeight / yGap)

        const xStart = (width - xGap * totalLines) / 2
        const yStart = (height - yGap * totalPoints) / 2

        // Build all paths in a document fragment to avoid layout thrashing
        const fragment = document.createDocumentFragment()

        for (let i = 0; i < totalLines; i++) {
            const points: Point[] = []

            for (let j = 0; j < totalPoints; j++) {
                const point: Point = {
                    x: xStart + xGap * i,
                    y: yStart + yGap * j,
                    wave: { x: 0, y: 0 },
                    cursor: { x: 0, y: 0, vx: 0, vy: 0 },
                }

                points.push(point)
            }

            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            )
            path.setAttribute('fill', 'none')
            path.setAttribute('stroke', strokeColor)
            path.setAttribute('stroke-opacity', '0.35')
            path.setAttribute('stroke-width', '1')

            fragment.appendChild(path)
            pathsRef.current.push(path)

            linesRef.current.push(points)
        }

        svgRef.current.appendChild(fragment)
    }

    const onResize = () => {
        setSize()
        setLines()
    }

    const onMouseMove = (e: MouseEvent) => {
        updateMousePosition(e.pageX, e.pageY)
    }

    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        updateMousePosition(touch.clientX, touch.clientY)
    }

    const updateMousePosition = (x: number, y: number) => {
        if (!boundingRef.current) return

        const mouse = mouseRef.current
        mouse.x = x - boundingRef.current.left
        mouse.y = y - boundingRef.current.top + window.scrollY

        if (!mouse.set) {
            mouse.sx = mouse.x
            mouse.sy = mouse.y
            mouse.lx = mouse.x
            mouse.ly = mouse.y

            mouse.set = true
        }

        if (containerRef.current) {
            containerRef.current.style.setProperty('--x', `${mouse.sx}px`)
            containerRef.current.style.setProperty('--y', `${mouse.sy}px`)
        }
    }

    const movePoints = (time: number) => {
        const { current: lines } = linesRef
        const { current: mouse } = mouseRef
        const { current: noise } = noiseRef

        if (!noise) return

        const msx = mouse.sx
        const msy = mouse.sy
        const mvs = mouse.vs
        const ma = mouse.a
        const cosA = Math.cos(ma)
        const sinA = Math.sin(ma)
        const influence = Math.max(300, mvs * 2.5)

        for (let li = 0, ll = lines.length; li < ll; li++) {
            const points = lines[li]
            for (let pi = 0, pl = points.length; pi < pl; pi++) {
                const p = points[pi]

                const move = noise(
                    (p.x + time * 0.008) * 0.003,
                    (p.y + time * 0.003) * 0.002
                ) * 8

                p.wave.x = Math.cos(move) * 12
                p.wave.y = Math.sin(move) * 6

                const dx = p.x - msx
                const dy = p.y - msy
                const d = Math.sqrt(dx * dx + dy * dy)

                if (d < influence) {
                    const s = 1 - d / influence
                    const f = Math.cos(d * 0.001) * s

                    p.cursor.vx += cosA * f * influence * mvs * 0.005
                    p.cursor.vy += sinA * f * influence * mvs * 0.005
                }

                p.cursor.vx += (0 - p.cursor.x) * 0.04
                p.cursor.vy += (0 - p.cursor.y) * 0.04

                p.cursor.vx *= 0.85
                p.cursor.vy *= 0.85

                p.cursor.x += p.cursor.vx
                p.cursor.y += p.cursor.vy

                p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x))
                p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y))
            }
        }
    }

    const drawLines = () => {
        const { current: lines } = linesRef
        const { current: paths } = pathsRef

        for (let lIndex = 0, ll = lines.length; lIndex < ll; lIndex++) {
            const points = lines[lIndex]
            if (points.length < 2 || !paths[lIndex]) continue

            const fp = points[0]
            // First point without cursor force
            const parts: string[] = [`M ${fp.x + fp.wave.x} ${fp.y + fp.wave.y}`]

            for (let i = 1, pl = points.length; i < pl; i++) {
                const p = points[i]
                parts.push(`L ${p.x + p.wave.x + p.cursor.x} ${p.y + p.wave.y + p.cursor.y}`)
            }

            paths[lIndex].setAttribute('d', parts.join(''))
        }
    }

    const tick = (time: number) => {
        const { current: mouse } = mouseRef

        // Much faster cursor tracking
        mouse.sx += (mouse.x - mouse.sx) * 0.8
        mouse.sy += (mouse.y - mouse.sy) * 0.8

        const dx = mouse.x - mouse.lx
        const dy = mouse.y - mouse.ly
        const d = Math.sqrt(dx * dx + dy * dy)

        mouse.v = d
        mouse.vs += (d - mouse.vs) * 0.25
        mouse.vs = Math.min(100, mouse.vs)

        mouse.lx = mouse.x
        mouse.ly = mouse.y

        mouse.a = Math.atan2(dy, dx)

        if (containerRef.current) {
            containerRef.current.style.setProperty('--x', `${mouse.sx}px`)
            containerRef.current.style.setProperty('--y', `${mouse.sy}px`)
        }

        movePoints(time)
        drawLines()

        rafRef.current = requestAnimationFrame(tick)
    }

    return (
        <div
            ref={containerRef}
            className={`waves-component relative overflow-hidden ${className}`}
            style={{
                backgroundColor,
                position: 'absolute',
                top: 0,
                left: 0,
                margin: 0,
                padding: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                '--x': '-0.5rem',
                '--y': '50%',
            } as React.CSSProperties}
        >
            <svg
                ref={svgRef}
                className="block w-full h-full js-svg"
                xmlns="http://www.w3.org/2000/svg"
            />
            <div
                className="pointer-dot"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${pointerSize}rem`,
                    height: `${pointerSize}rem`,
                    background: strokeColor,
                    borderRadius: '50%',
                    transform: 'translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)',
                    willChange: 'transform',
                }}
            />
        </div>
    )
}
