import React from 'react'

const sections = [
  {
    title: 'Promotions & Visibilite',
    routes: [
      { method: 'GET', path: '/promos', description: 'Feed public des promotions produits et services', priority: 'Bloquant' },
      { method: 'GET', path: '/promos/featured', description: 'Promotions en vedette pour les bannieres accueil', priority: 'Secondaire' },
      { method: 'POST', path: '/promos/:id/view', description: 'Enregistrement silencieux des vues promo', priority: 'Secondaire' },
      { method: 'GET', path: '/stores/:id/promos', description: 'Promotions actives d un commerce specifique', priority: 'Important' },
    ],
  },
  {
    title: 'Reservations',
    routes: [
      { method: 'POST', path: '/auth/reservations', description: 'Creation d une reservation avec QR code', priority: 'Secondaire' },
      { method: 'GET', path: '/auth/reservations', description: 'Liste des reservations du client', priority: 'Secondaire' },
      { method: 'GET', path: '/auth/reservations/:id', description: 'Detail d une reservation', priority: 'Secondaire' },
      { method: 'DELETE', path: '/auth/reservations/:id', description: 'Annulation logique d une reservation', priority: 'Secondaire' },
      { method: 'POST', path: '/auth/reservations/:id/confirm', description: 'Confirmation en caisse apres scan QR', priority: 'Secondaire' },
    ],
  },
  {
    title: 'Commerces & Profil',
    routes: [
      { method: 'GET', path: '/stores', description: 'Liste publique des commerces actifs', priority: 'Important' },
      { method: 'GET', path: '/stores/:id', description: 'Detail d un commerce et infos publiques', priority: 'Important' },
      { method: 'GET', path: '/auth/users/me', description: 'Profil du compte connecte', priority: 'Bloquant' },
      { method: 'PATCH', path: '/auth/users/me', description: 'Mise a jour partielle du profil connecte', priority: 'Important' },
      { method: 'POST', path: '/auth/users/me/avatar', description: 'Upload ou remplacement de la photo de profil', priority: 'Important' },
    ],
  },
  {
    title: 'Notifications',
    routes: [
      { method: 'GET', path: '/auth/notifications', description: 'Liste des notifications du compte connecte', priority: 'Secondaire' },
      { method: 'PATCH', path: '/auth/notifications/:id/read', description: 'Marquer une notification comme lue', priority: 'Secondaire' },
      { method: 'PATCH', path: '/auth/notifications/read-all', description: 'Tout marquer comme lu', priority: 'Secondaire' },
      { method: 'POST', path: '/auth/notifications/device-token', description: 'Enregistrer le token push du device', priority: 'Secondaire' },
      { method: 'GET', path: '/auth/notifications/preferences', description: 'Lire les preferences de notifications', priority: 'Secondaire' },
      { method: 'PATCH', path: '/auth/notifications/preferences', description: 'Mettre a jour les preferences de notifications', priority: 'Secondaire' },
    ],
  },
]

const priorityClass = {
  Bloquant: 'bg-red-100 text-red-700',
  Important: 'bg-amber-100 text-amber-700',
  Secondaire: 'bg-emerald-100 text-emerald-700',
}

const methodClass = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  PATCH: 'bg-violet-100 text-violet-700',
  DELETE: 'bg-red-100 text-red-700',
}

export default function ApiRoutes() {
  const total = sections.reduce((sum, section) => sum + section.routes.length, 0)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Integration backend</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Routes API utiles au portail societe</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-500">
              Vue des endpoints MesPromos pertinents pour le commerçant: promos, reservations,
              profil, commerces et notifications.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Routes</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{total}</div>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Base URL</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">/api</div>
            </div>
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              <p className="text-sm text-gray-500">{section.routes.length} routes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-3">Methode</th>
                  <th className="px-3 py-3">Route</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Priorite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {section.routes.map((route) => (
                  <tr key={`${section.title}-${route.method}-${route.path}`} className="align-top">
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${methodClass[route.method]}`}>
                        {route.method}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <code className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-900">
                        {route.path}
                      </code>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">{route.description}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${priorityClass[route.priority]}`}>
                        {route.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
