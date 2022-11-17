import { createContext, useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import type { Drawable } from 'roughjs/bin/core';
import './App.css';

const generator = rough.generator();

function createElement(
	x1: any,
	y1: any,
	x2: any,
	y2: any,
	elementType: string
) {
	let roughElement: Drawable;
	if (elementType === 'line') {
		roughElement = generator.line(x1, y1, x2, y2);
	} else {
		roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
	}

	return { x1, y1, x2, y2, roughElement };
}

interface ElementState {
	x1: any;
	y1: any;
	x2: any;
	y2: any;
	roughElement: Drawable;
}

function App() {
	const [elements, setElements] = useState<ElementState[] | []>([]);
	const [drawing, setDrawing] = useState(false);
	const [elementType, setElementType] = useState<string>('line');
	const firstRun = useRef(true);
	let canvasContext = useRef<CanvasRenderingContext2D | null>(null);
	useLayoutEffect(() => {
		const canvas = document.getElementById('canvas') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		// canvasContext.current?.clearRect(0, 0, window.innerWidth, innerHeight);
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		// canvasContext.current = ctx;
		const roughCanvas = rough.canvas(canvas);

		// if (firstRun.current) {
		// 	const rect = generator.rectangle(10, 10, 100, 100);
		// 	roughCanvas.draw(rect);
		// 	firstRun.current = false;
		// }

		elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
		console.log('ran uselayouteffect');
	}),
		[elements];

	const onMouseDown = (event: any) => {
		setDrawing(true);
		const { clientX, clientY } = event;
		console.log('mouse down event', clientX, clientY);
		const element = createElement(
			clientX,
			clientY,
			clientX,
			clientY,
			elementType
		);
		setElements((prev: any) => [...prev, element]);
	};

	const onMouseMove = (event: any) => {
		if (!drawing) {
			return;
		}
		const { clientX, clientY } = event;
		console.log(clientX, clientY);
		const index = elements.length - 1;
		const { x1, y1 } = elements[index];
		const updatedElement = createElement(x1, y1, clientX, clientY, elementType);

		const elementsCopy = [...elements];
		elementsCopy[index] = updatedElement;
		setElements([...elementsCopy]);
	};

	const onMouseUp = () => {
		setDrawing(false);
	};

	return (
		<>
			<div>
				<button onClick={() => setElements([])}>Clear canvas</button>
				<input
					type='radio'
					onChange={() => setElementType('line')}
					id='line'
					checked={elementType === 'line'}></input>
				<label htmlFor='line'>Line</label>
				<input
					type='radio'
					id='rectangle'
					onChange={() => setElementType('rectangle')}
					checked={elementType === 'rectangle'}></input>
				<label htmlFor='rectangle'>Rectangle</label>
				<canvas
					width={window.innerWidth}
					height={window.innerHeight}
					id='canvas'
					onMouseDown={onMouseDown}
					onMouseMove={onMouseMove}
					onMouseUp={onMouseUp}>
					Canvas
				</canvas>
			</div>
		</>
	);
}

export default App;
