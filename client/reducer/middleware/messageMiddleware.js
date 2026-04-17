import { message } from 'antd';

export default () => next => action => {
  if (!action) {
    return;
  }
  if (action.error) {
    message.error((action.payload && action.payload.message) || '服务器错误');
    return next(action);
  }
  const data = action.payload && action.payload.data;
  if (data && data.errcode !== undefined && data.errcode !== null) {
    const errcode = Number(data.errcode);
    if (errcode === 40011) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return next(action);
    }
    if (errcode !== 0) {
      message.error(data.errmsg || data.message || '服务器错误');
      return next(action);
    }
  }
  return next(action);
};
