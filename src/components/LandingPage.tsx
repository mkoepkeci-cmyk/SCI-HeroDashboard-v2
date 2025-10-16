import { Users, ClipboardList, BarChart3, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            System Clinical Informatics Initiatives Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connecting system leaders, clinical informaticists, and senior leadership through
            integrated request management, capacity tracking, and value demonstration.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* User Personas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* System Leaders */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">System Leaders</h3>
            <p className="text-sm text-gray-600 mb-4">
              Clinical executives and operational leaders requesting SCI consultation
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Submit consultation requests</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Track request status</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Document impact categories</span>
              </div>
            </div>
          </div>

          {/* System Clinical Informaticists */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">SCIs</h3>
            <p className="text-sm text-gray-600 mb-4">
              Clinical informatics consultants executing initiatives and tracking work
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">View new assignments</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Log weekly effort</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Document outcomes & value</span>
              </div>
            </div>
          </div>

          {/* SCI Managers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">SCI Managers</h3>
            <p className="text-sm text-gray-600 mb-4">
              Directors managing team workload, capacity, and assignments
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Review & assign requests</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Monitor team capacity</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Reassign work dynamically</span>
              </div>
            </div>
          </div>

          {/* Senior Leadership */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Senior Leadership</h3>
            <p className="text-sm text-gray-600 mb-4">
              CNO, CIO, and executive team monitoring SCI value and impact
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">View all initiatives</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Track impact metrics</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Demonstrate ROI to Board</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            End-to-End Workflow
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Request Submitted</h4>
              <p className="text-sm text-gray-600">
                System leaders submit consultation requests via SCI Request Portal
              </p>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />

            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Review & Assign</h4>
              <p className="text-sm text-gray-600">
                SCI managers review requests, assess capacity, and assign to team members
              </p>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />

            {/* Step 3 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Work & Track</h4>
              <p className="text-sm text-gray-600">
                SCIs log weekly effort, document progress, and update initiative status
              </p>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />

            {/* Step 4 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Value Delivered</h4>
              <p className="text-sm text-gray-600">
                Impact metrics tracked on dashboard for senior leadership visibility
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* For Requesters */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📋 For System Leaders
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Navigate to SCI Requests</p>
                  <p className="text-sm text-gray-600">Click "SCI Requests" in the navigation menu</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Submit New Request</p>
                  <p className="text-sm text-gray-600">Complete the intake form with problem statement, impact categories, and affected groups</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Track Progress</p>
                  <p className="text-sm text-gray-600">Monitor request status and receive updates as work progresses</p>
                </div>
              </div>
            </div>
          </div>

          {/* For SCIs */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ⚡ For SCIs
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check My Effort</p>
                  <p className="text-sm text-gray-600">Navigate to "My Effort" to see all your assignments</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Log Weekly Effort</p>
                  <p className="text-sm text-gray-600">Click "Log Effort" tab and update hours spent on each initiative (5 min/week)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Document Outcomes</p>
                  <p className="text-sm text-gray-600">Add value metrics as initiatives progress to showcase your impact</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Managers */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📊 For SCI Managers
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Review Requests</p>
                  <p className="text-sm text-gray-600">Check SCI Requests portal for new submissions and pending requests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Monitor Capacity</p>
                  <p className="text-sm text-gray-600">View team member effort logs to assess workload and availability</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Assign & Balance</p>
                  <p className="text-sm text-gray-600">Assign requests to team members and reassign work to balance capacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Leadership */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📈 For Senior Leadership
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Dashboard</p>
                  <p className="text-sm text-gray-600">Start at "Overview" to see team-wide metrics and impact summary</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Explore Initiatives</p>
                  <p className="text-sm text-gray-600">Navigate to "Initiatives" to see detailed metrics, financial impact, and success stories</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Track ROI</p>
                  <p className="text-sm text-gray-600">Review value metrics: revenue impact, cost savings, time efficiency, and patient outcomes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-xl mb-3">🎯 Value Metrics Dashboard</h4>
              <ul className="space-y-2 text-purple-100">
                <li>• Real-time financial impact tracking</li>
                <li>• Operational efficiency metrics</li>
                <li>• Patient outcome visualization</li>
                <li>• Team portfolio views</li>
                <li>• Executive-ready reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3">⚖️ Capacity Management</h4>
              <ul className="space-y-2 text-purple-100">
                <li>• Weekly effort tracking</li>
                <li>• Workload visualization</li>
                <li>• Capacity utilization insights</li>
                <li>• Historical trend analysis</li>
                <li>• Data-driven assignment decisions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3">🔄 Integrated Workflow</h4>
              <ul className="space-y-2 text-purple-100">
                <li>• Digital intake portal</li>
                <li>• Request pipeline visibility</li>
                <li>• Auto-assignment to effort tracking</li>
                <li>• Status tracking & updates</li>
                <li>• End-to-end transparency</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform how your organization demonstrates SCI value, manages capacity, and delivers impact.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
          >
            Launch Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};