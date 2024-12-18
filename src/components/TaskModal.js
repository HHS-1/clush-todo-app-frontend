import React, { useState, useRef } from 'react'; 
import { Modal, Button } from 'react-bootstrap';
import { Editor } from '@toast-ui/react-editor'; 
import '@toast-ui/editor/dist/toastui-editor.css'; 
import '@toast-ui/editor/dist/i18n/ko-kr'; 

const TaskModal = ({ show, handleClose }) => {

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState(''); // 상태를 HTML로 저장
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [taskPriority, setTaskPriority] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTaskNameChange = (e) => {
    setTaskName(e.target.value);
  };

  const handleTaskPriorityChange = (e) => {
    setTaskPriority(e.target.value);
  };

  const editorRef = useRef(null); // 에디터 참조

  const handleTaskDescriptionChange = () => {
    const htmlContent = editorRef.current.getInstance().getHTML(); // 수정된 부분
    setTaskDescription(htmlContent); // 상태 업데이트
  };

  const saveToDo = async () => {
    const formData = {
        title : taskName,
        description : taskDescription, // HTML 형식으로 저장된 내용
        date : selectedDate,
        priority : taskPriority
    }

    try {
      const response = await fetch("http://localhost:8080/to-do", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(formData),
        headers : {
            'Content-Type' : "application/json"
        }
      });

      if (response.ok) {
        alert('작업이 추가되었습니다!');
        window.location.reload();
      } else {
        alert('작업 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error("Error saving ToDo:", error);
      alert('작업 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>작업 추가</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="mb-3">
            <label htmlFor="taskName" className="form-label">제목</label>
            <input
              type="text"
              className="form-control"
              id="taskName"
              value={taskName}
              onChange={handleTaskNameChange}
              placeholder="ex) clush 과제 세팅하기"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="taskDescription" className="form-label">작업 설명</label>
            <Editor
                ref={editorRef}
                value={taskDescription}
                onChange={handleTaskDescriptionChange}
                previewStyle="vertical" 
                height="300px" 
                initialEditType="wysiwyg"
                language="ko-KR" 
                toolbarItems={[
                    ['bold', 'italic', 'strike'], 
                    ['ul', 'ol', 'task', 'indent', 'outdent'], 
                    ['hr', 'quote'], 
                    ['link'] 
                  ]}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="taskDate" className="form-label">날짜</label>
            <input
              type="date"
              className="form-control"
              id="taskDate"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]} // 오늘 날짜를 최소값으로 설정
            />
          </div>
          <div className="mb-3">
            <label htmlFor="taskPriority" className="form-label">우선 순위</label>
            <input
              type="number"
              className='form-control'
              id="taskPriority"
              value={taskPriority}
              onChange={handleTaskPriorityChange}
              placeholder='우선순위를 입력'
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={saveToDo}>
          저장
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;
