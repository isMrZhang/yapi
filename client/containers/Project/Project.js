import React, { PureComponent as Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect, matchPath } from 'react-router-dom';
import { Subnav } from '../../components/index';
import { fetchGroupMsg } from '../../reducer/modules/group';
import { setBreadcrumb } from '../../reducer/modules/user';
import { getProject } from '../../reducer/modules/project';
import Interface from './Interface/Interface.js';
import Activity from './Activity/Activity.js';
import Setting from './Setting/Setting.js';
import Loading from '../../components/Loading/Loading';
import ProjectMember from './Setting/ProjectMember/ProjectMember.js';
import ProjectData from './Setting/ProjectData/ProjectData.js';
const plugin = require('client/plugin.js');
@connect(
  state => {
    return {
      curProject: state.project.currProject,
      currGroup: state.group.currGroup
    };
  },
  {
    getProject,
    fetchGroupMsg,
    setBreadcrumb
  }
)
export default class Project extends Component {
  static propTypes = {
    match: PropTypes.object,
    curProject: PropTypes.object,
    getProject: PropTypes.func,
    location: PropTypes.object,
    fetchGroupMsg: PropTypes.func,
    setBreadcrumb: PropTypes.func,
    currGroup: PropTypes.object
  };

  constructor(props) {
    super(props);
    this._unmounted = false;
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  async loadProject(projectId) {
    const projectAction = await this.props.getProject(projectId);
    const projectMsg = projectAction && projectAction.payload && projectAction.payload.data
      ? projectAction.payload.data.data
      : null;

    const groupId = projectMsg && projectMsg.group_id ? projectMsg.group_id : null;
    let groupMsg = null;
    if (groupId) {
      const groupAction = await this.props.fetchGroupMsg(groupId);
      groupMsg = groupAction && groupAction.payload && groupAction.payload.data
        ? groupAction.payload.data.data
        : null;
    }

    if (this._unmounted) {
      return;
    }

    const breadcrumbGroupName = (groupMsg && groupMsg.group_name) || this.props.currGroup.group_name;
    const breadcrumbGroupId = (groupMsg && groupMsg._id) || this.props.currGroup._id;
    const breadcrumbProjectName = (projectMsg && projectMsg.name) || this.props.curProject.name;

    if (breadcrumbGroupName && breadcrumbGroupId && breadcrumbProjectName) {
      this.props.setBreadcrumb([
        {
          name: breadcrumbGroupName,
          href: '/group/' + breadcrumbGroupId
        },
        {
          name: breadcrumbProjectName
        }
      ]);
    }
  }

  async componentDidMount() {
    await this.loadProject(this.props.match.params.id);
  }

  async componentDidUpdate(prevProps) {
    const prevProjectId = prevProps.match.params.id;
    const currProjectId = this.props.match.params.id;
    if (prevProjectId !== currProjectId) {
      await this.loadProject(currProjectId);
    }
  }

  render() {
    const { match, location } = this.props;
    let routers = {
      interface: { name: '接口', path: '/project/:id/interface/:action', component: Interface },
      activity: { name: '动态', path: '/project/:id/activity', component: Activity },
      data: { name: '数据管理', path: '/project/:id/data', component: ProjectData },
      members: { name: '成员管理', path: '/project/:id/members', component: ProjectMember },
      setting: { name: '设置', path: '/project/:id/setting', component: Setting }
    };

    plugin.emitHook('sub_nav', routers);

    let key, defaultName;
    for (key in routers) {
      if (
        matchPath(location.pathname, {
          path: routers[key].path
        }) !== null
      ) {
        defaultName = routers[key].name;
        break;
      }
    }

    // let subnavData = [{
    //   name: routers.interface.name,
    //   path: `/project/${match.params.id}/interface/api`
    // }, {
    //   name: routers.activity.name,
    //   path: `/project/${match.params.id}/activity`
    // }, {
    //   name: routers.data.name,
    //   path: `/project/${match.params.id}/data`
    // }, {
    //   name: routers.members.name,
    //   path: `/project/${match.params.id}/members`
    // }, {
    //   name: routers.setting.name,
    //   path: `/project/${match.params.id}/setting`
    // }];

    let subnavData = [];
    Object.keys(routers).forEach(key => {
      let item = routers[key];
      let value = {};
      if (key === 'interface') {
        value = {
          name: item.name,
          path: `/project/${match.params.id}/interface/api`
        };
      } else {
        value = {
          name: item.name,
          path: item.path.replace(/\:id/gi, match.params.id)
        };
      }
      subnavData.push(value);
    });

    if (this.props.currGroup.type === 'private') {
      subnavData = subnavData.filter(item => {
        return item.name != '成员管理';
      });
    }

    if (this.props.curProject == null || Object.keys(this.props.curProject).length === 0) {
      return <Loading visible />;
    }

    return (
      <div>
        <Subnav default={defaultName} data={subnavData} />
        <Switch>
          <Redirect exact from="/project/:id" to={`/project/${match.params.id}/interface/api`} />
          {/* <Route path={routers.activity.path} component={Activity} />
          
          <Route path={routers.setting.path} component={Setting} />
          {this.props.currGroup.type !== 'private' ?
            <Route path={routers.members.path} component={routers.members.component}/>
            : null
          }

          <Route path={routers.data.path} component={ProjectData} /> */}
          {Object.keys(routers).map(key => {
            let item = routers[key];

            return key === 'members' ? (
              this.props.currGroup.type !== 'private' ? (
                <Route path={item.path} component={item.component} key={key} />
              ) : null
            ) : (
              <Route path={item.path} component={item.component} key={key} />
            );
          })}
        </Switch>
      </div>
    );
  }
}
