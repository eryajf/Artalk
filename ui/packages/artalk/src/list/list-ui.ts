import ListLite from './list-lite'
import * as Utils from '../lib/utils'
import * as Ui from '../lib/ui'
import $t from '../i18n'

/** 界面刷新 */
export function refreshUI(list: ListLite) {
    // 无评论
    const isNoComment = list.ctx.getCommentList().length <= 0
    let $noComment = list.getCommentsWrapEl().querySelector<HTMLElement>('.atk-list-no-comment')

    if (isNoComment) {
      if (!$noComment) {
        $noComment = Utils.createElement('<div class="atk-list-no-comment"></div>')
        $noComment.innerHTML = list.noCommentText || list.ctx.conf.noComment || list.ctx.$t('noComment')
        list.getCommentsWrapEl().appendChild($noComment)
      }
    } else {
      $noComment?.remove()
    }

    // 仅管理员显示控制
    list.ctx.checkAdminShowEl()
}

/** 构建错误提示界面 */
export function renderErrorDialog(list: ListLite, errMsg: string, errData?: any): HTMLElement {
  const errEl = Utils.createElement(`<span>${errMsg}，${$t('listLoadFailMsg')}<br/></span>`)

  const $retryBtn = Utils.createElement(`<span style="cursor:pointer;">${$t('listRetry')}</span>`)
  $retryBtn.onclick = () => (list.fetchComments(0))
  errEl.appendChild($retryBtn)

  const adminBtn = Utils.createElement('<span atk-only-admin-show> | <span style="cursor:pointer;">打开控制台</span></span>')
  errEl.appendChild(adminBtn)
  if (!list.ctx.user.data.isAdmin) adminBtn.classList.add('atk-hide')

  let sidebarView = ''

  // 找不到站点错误，打开侧边栏并填入创建站点表单
  if (errData?.err_no_site) {
    const viewLoadParam = {
      create_name: list.ctx.conf.site,
      create_urls: `${window.location.protocol}//${window.location.host}`
    }
    // TODO 真的是飞鸽传书啊
    sidebarView = `sites|${JSON.stringify(viewLoadParam)}`
  }

  adminBtn.onclick = () => list.ctx.showSidebar({
    view: sidebarView as any
  })

  return errEl
}

/** 版本检测弹窗 */
export function versionCheckDialog(list: ListLite, name: 'frontend'|'backend', needVersion: string, curtVersion: string): boolean {
  const needUpdate = Utils.versionCompare(needVersion, curtVersion) === 1
  if (needUpdate) {
    // 需要更新
    const errEl = Utils.createElement(`<div>Artalk ${$t(name)}版本已过时，请更新以获得完整体验<br/>`
    + `如果你是管理员，请前往 “<a href="https://artalk.js.org/" target="_blank">官方文档</a>” 获得帮助`
    + `<br/><br/>`
    + `<span style="color: var(--at-color-meta);">当前${$t(name)}版本 ${curtVersion}，需求版本 >= ${needVersion}</span><br/><br/>`
    + `</div>`)
    const ignoreBtn = Utils.createElement('<span style="cursor:pointer;">忽略</span>')
    ignoreBtn.onclick = () => {
      Ui.setError(list.$el.parentElement!, null)
      list.ctx.conf.versionCheck = false
      list.fetchComments(0)
    }
    errEl.append(ignoreBtn)
    Ui.setError(list.$el.parentElement!, errEl, '<span class="atk-warn-title">Artalk Warn</span>')
  }

  return needUpdate
}
