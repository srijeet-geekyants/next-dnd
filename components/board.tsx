"use client";

import React, {useEffect} from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {useBoardStore} from "@/store/BoardStore";
import Column from '@/components/Column';
import {start} from "repl";

export default function Board() {

    const [board, getBoard, setBoardState, updateTodoInDB] = useBoardStore((state) => [
        state.board, state.getBoard, state.setBoardState, state.updateTodoInDB
    ]);

    useEffect(() => {
        getBoard();
    }, [getBoard]);


    const handleOnDragEnd = (result: DropResult) => {
            const { destination, source, type } = result;
            console.log(destination);
            console.log('----');
            console.log(source);
            console.log('----');
            console.log(type);

            // check if outside of board
            if(!destination) return;

            // column drag
            if(type === "column") {
                const entries = Array.from(board.columns.entries());
                const [removed] = entries.splice(source.index, 1);
                entries.splice(destination.index, 0, removed);
                const rearrangedColumns = new Map(entries);
                setBoardState({...board, columns: rearrangedColumns})

            }

            const columns = Array.from(board.columns);

            const startColIndex = columns[parseInt(source.droppableId)];
            const finishColIndex = columns[parseInt(destination.droppableId)];


            const startCol: Column = {
                id: startColIndex[0],
                todos: startColIndex[1].todos,
            }

            const finishCol: Column = {
                id: finishColIndex[0],
                todos: finishColIndex[1].todos,
            }

            if(!startCol || !finishCol) return;

            if(source.index  === destination.index && startCol === finishCol) return;


            const newTodos = startCol.todos;

            const [todoMoved] = newTodos.splice(source.index, 1);

            if(startCol.id === finishCol.id) {
                // same column task drag
                newTodos.splice(destination.index, 0, todoMoved);
                const newCol = {
                    id: startCol.id,
                    todos: newTodos,
                }
                const newColumns = new Map(board.columns);
                newColumns.set(startCol.id, newCol);

                setBoardState({
                     ...board,
                    columns: newColumns
                })
            } else {
                // dragging to another column
                const finishTodos = Array.from(finishCol.todos);
                finishTodos.splice(destination.index, 0, todoMoved);


                const newColumns = new Map(board.columns);
                const newCol = {
                    id: startCol.id,
                    todos: newTodos,
                }

                newColumns.set(startCol.id, newCol);
                newColumns.set(finishCol.id, {
                    id: finishCol.id,
                    todos: finishTodos,
                });

                console.log(todoMoved);
                // update in db
                updateTodoInDB(todoMoved, finishCol.id);


                setBoardState({ ...board, columns: newColumns });
            }
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="column">
                    {(provided) => (
                        <div
                            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {
                                Array.from(board.columns.entries()).map(([id, column], index) => (
                                    <Column key={id} id={id} todos={column.todos} index={index} />
                                ))
                            }
                        </div>
                    )}
                </Droppable>
        </DragDropContext>
    )
}
