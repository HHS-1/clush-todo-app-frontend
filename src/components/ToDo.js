import React, { useReducer, useEffect } from 'react';

// 초기 상태 설정
const initialState = {
  isInProgressVisible: true,
  isCompletedVisible: true,
  events: [],
  showToast: false,
  selectedDate: (() => {
    const today = new Date();
    today.setHours(today.getHours() + 9);
    return today.toISOString().split('T')[0];
  })(),
};

// 액션 타입 정의
const actionTypes = {
  TOGGLE_IN_PROGRESS: 'TOGGLE_IN_PROGRESS',
  TOGGLE_COMPLETED: 'TOGGLE_COMPLETED',
  SET_EVENTS: 'SET_EVENTS',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  TOGGLE_TOAST: 'TOGGLE_TOAST',
  CHANGE_STATUS: 'CHANGE_STATUS',
};

// 리듀서 함수
const todoReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.TOGGLE_IN_PROGRESS:
      return { ...state, isInProgressVisible: !state.isInProgressVisible };
    case actionTypes.TOGGLE_COMPLETED:
      return { ...state, isCompletedVisible: !state.isCompletedVisible };
    case actionTypes.SET_EVENTS:
      return { ...state, events: action.payload };
    case actionTypes.SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };
    case actionTypes.TOGGLE_TOAST:
      return { ...state, showToast: action.payload };
    case actionTypes.CHANGE_STATUS:
      return {
        ...state,
        events: state.events.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, status: action.payload.newStatus }
            : todo
        ),
      };
    default:
      return state;
  }
};

const Todo = ({ handleOpen }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const toggleInProgress = () => {
    dispatch({ type: actionTypes.TOGGLE_IN_PROGRESS });
  };

  const toggleCompleted = () => {
    dispatch({ type: actionTypes.TOGGLE_COMPLETED });
  };

  // 날짜에 맞는 Todo 목록을 가져오는 함수
  const getToDoListForDate = async (date) => {
    try {
      const response = await fetch(`http://localhost:8081/to-do/${date}/date`, { credentials: 'include' });
      if (response.status === 204) {
        dispatch({ type: actionTypes.SET_EVENTS, payload: [] });
      } else {
        const data = await response.json();
        dispatch({ type: actionTypes.SET_EVENTS, payload: data });
      }
    } catch (error) {
      console.log(error);
      alert('에러발생');
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    dispatch({ type: actionTypes.SET_SELECTED_DATE, payload: newDate });
    getToDoListForDate(newDate); // 변경된 날짜에 대한 Todo 목록을 가져옴
  };

  useEffect(() => {
    getToDoListForDate(state.selectedDate); // 컴포넌트가 마운트될 때 기본 날짜의 Todo 목록을 가져옴
  }, [state.selectedDate]);

  const changeStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === '진행중' ? '완료' : '진행중';
      const response = await fetch(`http://localhost:8081/to-do/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: newStatus,
      });

      if (response.ok) {
        dispatch({
          type: actionTypes.CHANGE_STATUS,
          payload: { id, newStatus },
        });

        if (newStatus === '완료') {
          dispatch({ type: actionTypes.TOGGLE_TOAST, payload: true });
          setTimeout(() => dispatch({ type: actionTypes.TOGGLE_TOAST, payload: false }), 3000);
        }
      }
    } catch (error) {
      console.log(error);
      alert('상태변경 실패');
    }
  };

  const showToDoModify = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/to-do/${id}`, { credentials: 'include' });
      const toDoDate = await response.json();

      if (response.status === 204) {
        alert('데이터가 존재하지 않습니다.');
        return null;
      } else {
        const event = new CustomEvent('dataFetched', { detail: toDoDate });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.log(error);
      alert('서버 오류로 인해 데이터를 불러오는 데 실패했습니다.');
    }
  };

  return (
    <div>
      <div>
        <h2>
          <input
            type="date"
            value={state.selectedDate}
            onChange={handleDateChange}
            style={{ marginBottom: '10px', fontSize: '30px' }}
          />
        </h2>
      </div>

      <div
        className="add-todo"
        onClick={handleOpen}
        style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}
      >
        + 작업 추가
      </div>

      <div
        onClick={toggleInProgress}
        style={{ cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '3px', marginBottom: '3px' }}
      >
        {state.isInProgressVisible ? '▼ 진행중' : '▶ 진행중'}
      </div>
      {state.isInProgressVisible && (
        <ul className="todo-list">
          {state.events
            .filter((todo) => todo.status === '진행중')  // 진행중인 할 일만 필터링
            .sort((a, b) => a.priority - b.priority)
            .map((todo) => (
              <li key={todo.id} style={{ fontWeight: 'bold' }} onClick={() => showToDoModify(todo.id)}>
                <div>
                  <input
                    type="checkbox"
                    checked={todo.status === '완료'}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      changeStatus(todo.id, todo.status);
                    }}
                  />
                  <span className="priority">{todo.priority}</span> {todo.title}
                </div>
                <div style={{ fontWeight: 'bold' }}>⁝</div>
              </li>
            ))}
        </ul>
      )}

      <div
        onClick={toggleCompleted}
        style={{ cursor: 'pointer', marginTop: '30px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '3px', marginBottom: '3px' }}
      >
        {state.isCompletedVisible ? '▼ 완료' : '▶ 완료'}
      </div>
      {state.isCompletedVisible && (
        <ul className="todo-list">
          {state.events
            .filter((todo) => todo.status === '완료')  // 완료된 할 일만 필터링
            .sort((a, b) => a.priority - b.priority)
            .map((todo) => (
              <li key={todo.id} style={{ fontWeight: 'lighter' }} onClick={() => showToDoModify(todo.id)}>
                <div>
                  <input
                    type="checkbox"
                    checked={todo.status === '완료'}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      changeStatus(todo.id, todo.status);
                    }}
                  />
                  <span className="priority">{todo.priority}</span> {todo.title}
                </div>
                <div style={{ fontWeight: 'bold' }}>⁝</div>
              </li>
            ))}
        </ul>
      )}

      {state.showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: state.showToast ? '20px' : '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgb(19, 51, 120)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'bottom 0.5s ease, opacity 0.5s ease',
            opacity: state.showToast ? 1 : 0,
            zIndex: 1000,
          }}
        >
          작업이 완료되었습니다!
        </div>
      )}
    </div>
  );
};

export default Todo;
