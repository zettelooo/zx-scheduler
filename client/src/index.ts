import { ZettelExtensions } from '@zettelooo/extension-api'
import { PageExtensionData } from 'shared'
import { whileCard } from './whileCard'
import { submitAvailabilities } from './submitAvailabilities'

void ((window as ZettelExtensions.WindowWithStarter).$starter = function (api) {
  this.while('activated', function ({ activatedApi }) {
    this.while('signedIn', function ({ signedInApi }) {
      this.while('pagePanel', function ({ pagePanelApi }) {
        if (!this.scopes.includes(ZettelExtensions.Scope.Page)) return // TODO: This is redundant and should be removed later

        let activating = false
        const activate = async (command?: string): Promise<void> => {
          if (activating) return
          try {
            activating = true
            await submitAvailabilities.bind(this)(
              { activatedApi, pagePanelApi },
              { setQuickActionDisabled, setLoadingIndicatorVisible, description: command }
            )
          } finally {
            activating = false
          }
        }

        const quickActionRegistration = this.register(
          pagePanelApi.registry.quickAction(() => ({
            title: api.header.name,
            description: api.header.description,
            avatarUrl: api.header.avatarUrl,
            async onClick() {
              setQuickActionDisabled(true)
              await activate()
              setQuickActionDisabled(false)
            },
          }))
        )
        function setQuickActionDisabled(disabled: boolean): void {
          quickActionRegistration.reference.current?.update({ disabled })
        }

        const loadingIndicatorRegistration = this.register(
          pagePanelApi.registry.loadingIndicator(() => 'Please wait...'),
          { initiallyInactive: true }
        )
        function setLoadingIndicatorVisible(visible: boolean): void {
          if (visible) {
            loadingIndicatorRegistration.activate()
          } else {
            loadingIndicatorRegistration.deactivate()
          }
        }

        const statusReadonlyRegistration = this.register(
          pagePanelApi.registry.status(() => ({
            hideCardOwners: true,
          })),
          { initiallyInactive: true }
        )

        this.register(
          pagePanelApi.watch(
            data => data.page.extensionData as PageExtensionData,
            pageExtensionData => {
              if (pageExtensionData?.enabled) {
                statusReadonlyRegistration.activate()
                if (pageExtensionData?.enabled) {
                  signedInApi.access.setPageExtensionData<PageExtensionData>(pagePanelApi.target.pageId, undefined)
                  activate(pageExtensionData.command)
                }
              }
            },
            {
              initialCallback: true,
            }
          )
        )

        whileCard.bind(this)({ activatedApi })
      })
    })

    this.while('publicPageView', function ({ publicPageViewApi }) {
      if (!this.scopes.includes(ZettelExtensions.Scope.Page)) return // TODO: This is redundant and should be removed later

      whileCard.bind(this)({ activatedApi })
    })

    this.while('publicCardView', function ({ publicCardViewApi }) {
      if (!this.scopes.includes(ZettelExtensions.Scope.Page)) return // TODO: This is redundant and should be removed later

      whileCard.bind(this)({ activatedApi })
    })
  })
})
