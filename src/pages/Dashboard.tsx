import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, MessageCircle, Languages, Trophy, Target, Calendar, TrendingUp, Star, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();

  const weeklyData = [
    { day: 'Mon', xp: 120 },
    { day: 'Tue', xp: 85 },
    { day: 'Wed', xp: 200 },
    { day: 'Thu', xp: 150 },
    { day: 'Fri', xp: 90 },
    { day: 'Sat', xp: 180 },
    { day: 'Sun', xp: 140 },
  ];

  const categoryProgress = [
    { name: 'Greetings', value: 85, color: '#22c55e' },
    { name: 'Food', value: 60, color: '#ea580c' },
    { name: 'Family', value: 40, color: '#64748b' },
    { name: 'Other', value: 25, color: '#8b5cf6' },
  ];

  const stats = [
    {
      title: 'Cards Learned',
      value: state.flashcards.filter(card => card.timesCorrect > 0).length.toString(),
      change: '+12 this week',
      icon: BookOpen,
      color: 'text-welsh-green-600',
      bgColor: 'bg-welsh-green-100 dark:bg-welsh-green-900/20',
    },
    {
      title: 'Quiz Stages',
      value: state.userProgress.stagesCompleted.toString(),
      change: `${state.quizStages.filter(s => !s.completed).length} remaining`,
      icon: Trophy,
      color: 'text-welsh-orange-600',
      bgColor: 'bg-welsh-orange-100 dark:bg-welsh-orange-900/20',
    },
    {
      title: 'Total XP',
      value: (state.user?.xp || 0).toString(),
      change: `Level ${state.user?.level || 1}`,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Quiz Score',
      value: state.userProgress.totalQuizScore.toString(),
      change: 'Average performance',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
  ];

  const currentStage = state.quizStages.find(stage => stage.id === state.currentStage);
  const nextStage = state.quizStages.find(stage => stage.id === state.currentStage + 1);

  const dailyChallenges = [
    { id: 1, title: 'Learn 15 new words', progress: 12, total: 15, reward: '50 XP' },
    { id: 2, title: 'Complete a quiz stage', progress: currentStage?.completed ? 1 : 0, total: 1, reward: '100 XP' },
    { id: 3, title: 'Practice for 20 minutes', progress: 15, total: 20, reward: '40 XP' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {state.user?.name}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to continue your Welsh learning journey?
        </p>
      </div>

      {/* Current Stage Progress */}
      {currentStage && (
        <div className="bg-gradient-to-r from-welsh-green-500 to-welsh-orange-500 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Stage {currentStage.id}: {currentStage.name}</h3>
              <p className="opacity-90">{currentStage.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentStage.completed ? '100%' : '0%'}</div>
              <div className="text-sm opacity-90">
                {currentStage.completed ? 'Completed!' : `${currentStage.requiredCards} cards needed`}
              </div>
            </div>
          </div>
          
          {currentStage.completed ? (
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Trophy size={24} className="text-yellow-300" />
                <div>
                  <div className="font-semibold">Stage Completed!</div>
                  <div className="text-sm opacity-90">Score: {currentStage.score}%</div>
                </div>
              </div>
              {nextStage && (
                <button
                  onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: nextStage.id })}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  Start Next Stage
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'flashcards' })}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Learning
            </button>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-welsh-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-welsh-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-xs text-welsh-green-600 dark:text-welsh-green-400">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quiz Stages Overview */}
      <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Learning Stages
          </h3>
          <Target size={20} className="text-welsh-orange-600" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.quizStages.slice(0, 6).map((stage) => (
            <div
              key={stage.id}
              className={`p-4 rounded-lg border transition-all ${
                stage.completed
                  ? 'border-welsh-green-200 dark:border-welsh-green-800 bg-welsh-green-50 dark:bg-welsh-green-900/20'
                  : stage.unlockedAt
                  ? 'border-welsh-orange-200 dark:border-welsh-orange-800 bg-welsh-orange-50 dark:bg-welsh-orange-900/20'
                  : 'border-gray-200 dark:border-welsh-slate-700 bg-gray-50 dark:bg-welsh-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Stage {stage.id}
                </h4>
                {stage.completed && (
                  <Trophy size={16} className="text-welsh-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {stage.name}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stage.completed
                  ? `Completed with ${stage.score}%`
                  : stage.unlockedAt
                  ? `${stage.requiredCards} cards required`
                  : 'Locked'
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Progress Chart */}
        <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Progress
            </h3>
            <TrendingUp size={20} className="text-welsh-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis hide />
              <Bar
                dataKey="xp"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Progress */}
        <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Progress
            </h3>
            <Target size={20} className="text-welsh-orange-600" />
          </div>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={120}>
              <PieChart>
                <Pie
                  data={categoryProgress}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                >
                  {categoryProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryProgress.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily Challenges
          </h3>
          <Calendar size={20} className="text-welsh-slate-600" />
        </div>
        <div className="space-y-4">
          {dailyChallenges.map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-welsh-slate-700 rounded-lg">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {challenge.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-welsh-slate-600 rounded-full h-2">
                    <div
                      className="bg-welsh-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <span className="text-sm font-medium text-welsh-orange-600 dark:text-welsh-orange-400">
                  {challenge.reward}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-gradient-to-br from-welsh-green-50 to-welsh-orange-50 dark:from-welsh-green-900/20 dark:to-welsh-orange-900/20 rounded-xl p-6 border border-welsh-green-200 dark:border-welsh-green-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Achievements
          </h3>
          <Trophy size={20} className="text-welsh-orange-600" />
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {[
            { title: 'First Steps', icon: '👣', date: '2 days ago' },
            { title: 'Custom Creator', icon: '✨', date: '1 week ago' },
            { title: 'Stage Master', icon: '🏆', date: '2 weeks ago' },
          ].map((achievement, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-white dark:bg-welsh-slate-800 rounded-lg p-4 w-32 text-center shadow-sm animate-bounce-subtle"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {achievement.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {achievement.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;