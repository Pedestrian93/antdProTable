/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import { Divider, Row, Col, Checkbox, Popover, Table, Tooltip, Menu, Dropdown } from 'antd';
import { ColumnHeightOutlined, PushpinOutlined, SettingTwoTone } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import styles from './refined.less';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });
  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

export default function(props) {
  // 同一页面出现多个 Table 需要给出 key
  // 需要columns每个元素提供key值
  const [ls, setLs] = useLocalStorage(`${window.location.pathname}_CHIJITABLE_${props.key || ''}`, {
    show: [],
    left: props.columns.filter(i => i.fixed === 'left').map(i => i.key),
    right: props.columns.filter(i => i.fixed === 'right').map(i => i.key),
    all: props.columns.map(i => i.key),
    size: props.size,
  });
  const [keyTitleMap, setkeyTitleMap] = useState({});

  useEffect(() => {
    onInitializeColsState();
    // key title map
    const map = {};
    props.columns.forEach(i => {
      map[i.key] = typeof i.title === 'string' ? i.title : i.key;
    });
    setkeyTitleMap(map);
  }, []);

  function onInitializeColsState() {
    if (ls.show.length === 0) {
      // 初始化
      props.columns.forEach(col => {
        ls.show.push(col.key);
        if (col.fixed) {
          ls[col.fixed].push(col.key);
        }
      });
    }
    setLs({ ...ls });
  }

  const onCheckAll = checked => {
    const list = [];
    if (checked) {
      props.columns.forEach(col => {
        list.push(col.key);
      });
    }
    ls.show = list;
    setLs({ ...ls });
  };

  const onColsCheck = (key, checked) => {
    if (checked) {
      ls.show.push(key);
    } else {
      ls.show.splice(ls.show.indexOf(key), 1);
    }
    setLs({ ...ls });
  };

  const onPin = (key, type) => {
    if (type === 'cancel') {
      if (ls.right.indexOf(key) !== -1) {
        ls.right.splice(ls.right.indexOf(key), 1);
      }
      if (ls.left.indexOf(key) !== -1) {
        ls.left.splice(ls.left.indexOf(key), 1);
      }
    } else {
      ls[type].push(key);
      const theOtherType = type === 'left' ? 'right' : 'left';
      if (ls[theOtherType].indexOf(key) !== -1) {
        ls[theOtherType].splice(ls[theOtherType].indexOf(key), 1);
      }
    }
    setLs({ ...ls });
  };

  const onSizeChange = s => {
    ls.size = s;
    setLs({ ...ls });
  };
  // Popover
  const content = () => {
    const { show, left, right, all } = ls;
    const mid = all.filter(i => !left.includes(i) && !right.includes(i));
    return (
      <div className={styles.content}>
        <Row className="title" justify="space-between">
          <Col>
            <Checkbox checked={!(show.length === 0)} onChange={e => onCheckAll(e.target.checked)}>
              <h4 style={{ display: 'inline-block' }}>列展示</h4>
            </Checkbox>
          </Col>
          <div>
            <a onClick={onInitializeColsState}>重置</a>
          </div>
        </Row>

        <Divider style={{ margin: '1px' }} />
        <div>
          {left.length > 0 && (
            <div>
              <span style={{ fontSize: '12px' }}>固定在左侧</span>
              {left.map(key => (
                <div className={styles.fa}>
                  <Row className={styles.row} key={key} justify="space-between">
                    <Col>
                      <Checkbox
                        key={`left_${key}`}
                        checked={show.includes(key)}
                        onChange={e => onColsCheck(key, e.target.checked)}
                      >
                        {keyTitleMap[key]}
                      </Checkbox>
                    </Col>
                    <Col className={styles.xx}>
                      <a>
                        <Tooltip title="取消固定">
                          <ColumnHeightOutlined
                            className={styles.iconfont}
                            onClick={() => onPin(key, 'cancel')}
                          />
                        </Tooltip>
                      </a>
                      &nbsp;
                      <a>
                        <Tooltip title="固定在右边">
                          <PushpinOutlined
                            className={styles.iconfont}
                            onClick={() => onPin(key, 'right')}
                          />
                        </Tooltip>
                      </a>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
          {mid.length > 0 && (
            <div>
              <span style={{ fontSize: '12px' }}>不固定</span>
              {mid.map(key => (
                <div className={styles.fa}>
                  <Row className={styles.row} justify="space-between">
                    <Col>
                      <Checkbox
                        checked={show.includes(key)}
                        onChange={e => onColsCheck(key, e.target.checked)}
                        key={`mid_${key}`}
                      >
                        {keyTitleMap[key]}
                      </Checkbox>
                    </Col>
                    <Col className={styles.xx}>
                      <a>
                        <Tooltip title="固定在左边">
                          <PushpinOutlined
                            onClick={() => onPin(key, 'left')}
                            className={[styles['flip-horizontal'], styles.iconfont]}
                          />
                        </Tooltip>
                      </a>
                      &nbsp;
                      <a>
                        <Tooltip title="固定在右边">
                          <PushpinOutlined
                            className={styles.iconfont}
                            onClick={() => onPin(key, 'right')}
                          />
                        </Tooltip>
                      </a>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}

          {right.length > 0 && (
            <div>
              <span style={{ fontSize: '12px' }}>固定在右侧</span>
              {right.map(key => (
                <div className={styles.fa}>
                  <Row className={styles.row} key={key} justify="space-between">
                    <Col>
                      <Checkbox
                        key={`right_${key}`}
                        checked={show.includes(key)}
                        onChange={e => onColsCheck(key, e.target.checked)}
                      >
                        {keyTitleMap[key]}
                      </Checkbox>
                    </Col>
                    <Col className={styles.xx}>
                      <a>
                        <Tooltip title="固定在左边">
                          <PushpinOutlined
                            className={[styles['flip-horizontal'], styles.iconfont]}
                            onClick={() => onPin(key, 'left')}
                          />
                        </Tooltip>
                      </a>
                      &nbsp;
                      <a>
                        <Tooltip title="取消固定">
                          <ColumnHeightOutlined
                            className={styles.iconfont}
                            onClick={() => onPin(key, 'cancel')}
                          />
                        </Tooltip>
                      </a>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const colsfiltered = cloneDeep(props.columns).filter(col => ls.show.includes(col.key));

  colsfiltered.forEach(col => {
    if (ls.left.includes(col.key)) {
      col.fixed = 'left';
    }
    if (ls.right.includes(col.key)) {
      col.fixed = 'right';
    }
  });

  colsfiltered.sort(a => {
    if (a.fixed === 'left') {
      return -1;
    }
    if (a.fixed === 'right') {
      return 1;
    }
    return 0;
  });

  return (
    <>
      <div
        style={{
          paddingRight: '10px',
          textAlign: 'right',
          lineHeight: '40px',
          fontSize: '20px',
          color: '#3f91f7',
          wordSpacing: '10px',
        }}
      >
        <Tooltip title="密度">
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu
                onClick={v => {
                  onSizeChange(v.key);
                }}
              >
                <Menu.Item
                  style={{ backgroundColor: props.size === 'default' ? 'grey' : '' }}
                  key="default"
                >
                  默认
                </Menu.Item>
                <Menu.Item
                  style={{ backgroundColor: props.size === 'small' ? 'grey' : '' }}
                  key="small"
                >
                  紧凑
                </Menu.Item>
                <Menu.Item
                  style={{ backgroundColor: props.size === 'middle' ? 'grey' : '' }}
                  key="middle"
                >
                  大尺寸
                </Menu.Item>
              </Menu>
            }
          >
            <ColumnHeightOutlined style={{ marginRight: '24px' }} />
          </Dropdown>
        </Tooltip>
        <Tooltip title="列设置">
          <Popover trigger={['click']} placement="bottomRight" content={content()}>
            <SettingTwoTone />
          </Popover>
        </Tooltip>
      </div>
      <Table scroll={{ x: 'max-content' }} size={props.size} {...props} columns={colsfiltered} />
    </>
  );
}
