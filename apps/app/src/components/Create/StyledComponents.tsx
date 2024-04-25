import styled from "styled-components";

export const S = {
  CreateButton: styled.button`
    margin: 5px;
    padding: 0.5rem 1rem;
    font-size: 16px;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    opacity: ${props => props.disabled ? 0.5 : 1};

    &:hover {
      background-color: ${props => props.disabled ? '#007bff' : '#0056b3'};
    }
  `,
  InputField: styled.input`
    display: block;
    margin: 5px 0;
    padding: 8px;
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
  `,
  TextArea: styled.textarea`
    display: block;
    margin: 5px 0;
    padding: 8px;
    width: 300px;
    height: 100px;
    border: 1px solid #ccc;
    border-radius: 4px;
  `
}