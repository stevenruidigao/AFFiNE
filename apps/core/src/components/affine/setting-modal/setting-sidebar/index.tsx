import { ScrollableContainer } from '@affine/component';
import {
  WorkspaceListItemSkeleton,
  WorkspaceListSkeleton,
} from '@affine/component/setting-components';
import { WorkspaceAvatar } from '@affine/component/workspace-avatar';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import type { RootWorkspaceMetadata } from '@affine/workspace/atom';
import { rootWorkspacesMetadataAtom } from '@affine/workspace/atom';
import { Tooltip } from '@toeverything/components/tooltip';
import { useBlockSuiteWorkspaceName } from '@toeverything/hooks/use-block-suite-workspace-name';
import { useStaticBlockSuiteWorkspace } from '@toeverything/infra/__internal__/react';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { Suspense, useRef } from 'react';

import { useCurrentWorkspace } from '../../../../hooks/current/use-current-workspace';
import type {
  GeneralSettingKeys,
  GeneralSettingList,
} from '../general-setting';
import {
  currentWorkspaceLabel,
  settingSlideBar,
  sidebarItemsWrapper,
  sidebarSelectItem,
  sidebarSubtitle,
  sidebarTitle,
} from './style.css';

interface SettingSidebarProps {
  generalSettingList: GeneralSettingList;
  onGeneralSettingClick: (key: GeneralSettingKeys) => void;
  onWorkspaceSettingClick: (workspaceId: string) => void;
  selectedWorkspaceId: string | null;
  selectedGeneralKey: string | null;
  onAccountSettingClick: () => void;
}

export const SettingSidebar = ({
  generalSettingList,
  onGeneralSettingClick,
  onWorkspaceSettingClick,
  selectedWorkspaceId,
  selectedGeneralKey,
}: SettingSidebarProps) => {
  const t = useAFFiNEI18N();

  return (
    <div className={settingSlideBar} data-testid="settings-sidebar">
      <div className={sidebarTitle}>{t['Settings']()}</div>
      <div className={sidebarSubtitle}>{t['General']()}</div>
      <div className={sidebarItemsWrapper}>
        {generalSettingList.map(({ title, icon, key, testId }) => {
          if (!runtimeConfig.enablePlugin && key === 'plugins') {
            return null;
          }
          return (
            <div
              className={clsx(sidebarSelectItem, {
                active: key === selectedGeneralKey,
              })}
              key={key}
              title={title}
              onClick={() => {
                onGeneralSettingClick(key);
              }}
              data-testid={testId}
            >
              {icon({ className: 'icon' })}
              <span className="setting-name">{title}</span>
            </div>
          );
        })}
      </div>

      <div className={sidebarSubtitle}>
        {t['com.affine.settings.workspace']()}
      </div>
      <div className={clsx(sidebarItemsWrapper, 'scroll')}>
        <Suspense fallback={<WorkspaceListSkeleton />}>
          <ScrollableContainer>
            <WorkspaceList
              onWorkspaceSettingClick={onWorkspaceSettingClick}
              selectedWorkspaceId={selectedWorkspaceId}
            />
          </ScrollableContainer>
        </Suspense>
      </div>
    </div>
  );
};

interface WorkspaceListProps {
  onWorkspaceSettingClick: (workspaceId: string) => void;
  selectedWorkspaceId: string | null;
}

export const WorkspaceList = ({
  onWorkspaceSettingClick,
  selectedWorkspaceId,
}: WorkspaceListProps) => {
  const workspaces = useAtomValue(rootWorkspacesMetadataAtom);
  const [currentWorkspace] = useCurrentWorkspace();
  return (
    <>
      {workspaces.map(workspace => {
        return (
          <Suspense key={workspace.id} fallback={<WorkspaceListItemSkeleton />}>
            <WorkspaceListItem
              meta={workspace}
              onClick={() => {
                onWorkspaceSettingClick(workspace.id);
              }}
              isCurrent={workspace.id === currentWorkspace.id}
              isActive={workspace.id === selectedWorkspaceId}
            />
          </Suspense>
        );
      })}
    </>
  );
};

interface WorkspaceListItemProps {
  meta: RootWorkspaceMetadata;
  onClick: () => void;
  isCurrent: boolean;
  isActive: boolean;
}

const WorkspaceListItem = ({
  meta,
  onClick,
  isCurrent,
  isActive,
}: WorkspaceListItemProps) => {
  const workspace = useStaticBlockSuiteWorkspace(meta.id);
  const [workspaceName] = useBlockSuiteWorkspaceName(workspace);
  const ref = useRef(null);

  return (
    <div
      className={clsx(sidebarSelectItem, { active: isActive })}
      title={workspaceName}
      onClick={onClick}
      data-testid="workspace-list-item"
      ref={ref}
    >
      <WorkspaceAvatar size={14} workspace={workspace} className="icon" />
      <span className="setting-name">{workspaceName}</span>
      {isCurrent ? (
        <Tooltip
          content="Current"
          side="top"
          portalOptions={{
            container: ref.current,
          }}
        >
          <div
            className={currentWorkspaceLabel}
            data-testid="current-workspace-label"
          ></div>
        </Tooltip>
      ) : null}
    </div>
  );
};
