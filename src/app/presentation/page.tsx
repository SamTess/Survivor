"use client";
import React from 'react';
import { SlideDeck, Slide } from '@/components/presentation/SlideDeck';
import { 
	Rocket, LineChart, AlertTriangle, Target, 
	CalendarClock, TrendingUp, Zap, Star, CheckCircle, Brain, Globe,
	Shield, Sparkles, Diamond, Building, Heart, Eye, MessageSquare,
	Clock, ArrowRight, Play, Database, Code, Palette, Trophy, Users,
	BarChart3, Lightbulb, Settings, Network, GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Keynote finale - Investisseurs - 10 minutes max - Focus impact & professionnalisme
const slides: Slide[] = [
	{
		id: 'cover',
		title: 'SURVIVOR',
		subtitle: 'Plateforme Deal Flow Intelligente',
		content: (
			<div className="h-full w-full flex flex-col justify-center relative">
				{/* Éléments décoratifs de fond améliorés */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
					<div className="absolute bottom-20 left-16 w-24 h-24 rounded-full bg-gradient-to-tr from-accent/15 to-primary/15 animate-bounce" style={{animationDuration: '3s'}} />
					<div className="absolute top-20 left-20 w-20 h-20 rounded-full bg-gradient-to-bl from-secondary/15 to-transparent animate-pulse" style={{animationDelay: '2s'}} />
					<div className="absolute bottom-10 right-10 w-28 h-28 rounded-full bg-gradient-to-tr from-primary/10 to-transparent animate-pulse" style={{animationDelay: '4s'}} />
					<Sparkles className="absolute top-32 left-1/4 w-8 h-8 text-primary/30 animate-pulse" />
					<Diamond className="absolute bottom-32 right-1/3 w-6 h-6 text-accent/40 animate-pulse" style={{animationDelay: '1s'}} />
					<Star className="absolute top-1/4 right-10 w-7 h-7 text-secondary/40 animate-pulse" style={{animationDelay: '3s'}} />
					<Brain className="absolute bottom-1/4 left-10 w-6 h-6 text-primary/35 animate-pulse" style={{animationDelay: '2.5s'}} />
					<Trophy className="absolute top-10 left-1/2 w-5 h-5 text-accent/50 animate-pulse" style={{animationDelay: '1.8s'}} />
					<Rocket className="absolute bottom-10 left-1/3 w-6 h-6 text-secondary/45 animate-pulse" style={{animationDelay: '3.5s'}} />
				</div>
				
				<div className="text-center mb-12 relative z-10">
					<div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border-2 border-primary/30 mb-8 backdrop-blur-sm shadow-lg">
						<Trophy className="w-6 h-6 text-primary animate-pulse" />
						<span className="text-base font-bold tracking-wider">KEYNOTE FINALE • INVESTISSEURS</span>
						<Rocket className="w-6 h-6 text-accent animate-pulse" style={{animationDelay: '0.5s'}} />
					</div>
				</div>

				<div className="grid md:grid-cols-4 gap-6 mt-8">
					{[{
						icon: <TrendingUp className="w-12 h-12" />, 
						label: 'TRACTION', 
						value: 'Pipeline Actif',
						color: 'primary'
					},{
						icon: <Brain className="w-12 h-12" />, 
						label: 'INTELLIGENCE', 
						value: 'Scoring Dynamique',
						color: 'accent'
					},{
						icon: <Zap className="w-12 h-12" />, 
						label: 'VITESSE', 
						value: 'Exécution Rapide',
						color: 'secondary'
					},{
						icon: <Star className="w-12 h-12" />, 
						label: 'QUALITÉ', 
						value: 'Signal Précis',
						color: 'primary'
					}].map((b,i)=>(
						<div key={i} className="group relative p-8 rounded-3xl bg-gradient-to-br from-background/60 to-background/20 border border-primary/20 hover:border-primary/50 transition-all duration-500 backdrop-blur-sm hover:scale-105">
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_70%_30%,theme(colors.primary)/0.15,transparent_60%)]" />
							<div className="relative flex flex-col items-center gap-4 text-center">
								<div className={`text-${b.color} drop-shadow-lg`}>{b.icon}</div>
								<div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{b.label}</div>
								<div className="text-lg font-semibold leading-tight">{b.value}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	},
	{
		id: 'problem',
		title: 'LE DÉFI',
		subtitle: 'Signal vs Bruit dans l&apos;écosystème startup',
		content: (
			<div className="h-full relative">
				{/* Éléments décoratifs améliorés */}
				<div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-bl from-destructive/10 to-transparent animate-pulse" />
				<div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-primary/10 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
				<AlertTriangle className="absolute top-20 left-20 w-8 h-8 text-destructive/20 animate-pulse" style={{animationDelay: '2s'}} />
				<Target className="absolute bottom-20 right-20 w-8 h-8 text-primary/30 animate-pulse" style={{animationDelay: '3s'}} />
				<Sparkles className="absolute top-1/2 left-10 w-6 h-6 text-accent/40 animate-pulse" style={{animationDelay: '1.5s'}} />
				<Diamond className="absolute top-1/3 right-10 w-5 h-5 text-secondary/50 animate-pulse" style={{animationDelay: '2.5s'}} />
				
				<div className="grid md:grid-cols-2 gap-6 h-full items-center">
					{/* Problème */}
					<div className="space-y-4">
						<div className="relative p-4 rounded-xl bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/30 backdrop-blur-sm">
							<div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
								<AlertTriangle className="w-3 h-3 text-destructive" />
							</div>
							<h4 className="font-bold text-base mb-3 text-destructive">PROBLÈME</h4>
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<Globe className="w-4 h-4 text-destructive/70 mt-0.5" />
									<div>
										<div className="font-semibold text-sm">Investisseurs</div>
										<div className="text-sm text-muted-foreground">Bruit • Signal tardif • Temps qualification</div>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<Building className="w-4 h-4 text-destructive/70 mt-0.5" />
									<div>
										<div className="font-semibold text-sm">Fondateurs</div>
										<div className="text-sm text-muted-foreground">Visibilité • Feedback • Fragmentation</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Solution */}
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl" />
						<div className="relative p-4 rounded-xl border border-primary/30 backdrop-blur-sm">
							<div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
								<Target className="w-3 h-3 text-primary" />
							</div>
							<h4 className="font-bold text-base mb-3 text-primary">OPPORTUNITÉ</h4>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-primary" />
									<span className="font-semibold text-sm">Score Dynamique</span>
								</div>
								<div className="flex items-center gap-2">
									<Heart className="w-5 h-5 text-accent" />
									<span className="font-semibold text-sm">Workflow Relationnel</span>
								</div>
								<div className="flex items-center gap-2">
									<Eye className="w-5 h-5 text-secondary" />
									<span className="font-semibold text-sm">Signal Continu</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'solution',
		title: 'NOTRE SOLUTION',
		subtitle: 'Une plateforme unifiée • 4 piliers stratégiques',
		content: (
			<div className="h-full relative">
				{/* Éléments décoratifs animés améliorés */}
				<div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-spin" style={{animationDuration: '8s'}} />
				<div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-transparent animate-bounce" style={{animationDuration: '4s'}} />
				<div className="absolute top-20 right-20 w-12 h-12 rounded-full bg-gradient-to-bl from-secondary/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
				<div className="absolute bottom-20 left-20 w-14 h-14 rounded-full bg-gradient-to-tr from-primary/15 to-transparent animate-pulse" style={{animationDelay: '3s'}} />
				<Sparkles className="absolute top-1/4 right-1/4 w-6 h-6 text-primary/40 animate-pulse" />
				<Diamond className="absolute bottom-1/3 left-1/4 w-5 h-5 text-accent/50 animate-pulse" style={{animationDelay: '2s'}} />
				<Database className="absolute top-5 left-1/3 w-5 h-5 text-primary/30 animate-pulse" style={{animationDelay: '4s'}} />
				<CalendarClock className="absolute bottom-5 right-1/3 w-5 h-5 text-accent/35 animate-pulse" style={{animationDelay: '5s'}} />
				<LineChart className="absolute top-1/2 left-5 w-4 h-4 text-secondary/40 animate-pulse" style={{animationDelay: '2.5s'}} />
				<Brain className="absolute bottom-1/2 right-5 w-4 h-4 text-primary/45 animate-pulse" style={{animationDelay: '3.5s'}} />
				
				{/* Lignes de connexion stylisées multiples */}
				<div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
				<div className="absolute top-1/3 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
				<div className="absolute bottom-1/3 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
				
				<div className="grid md:grid-cols-4 gap-8 h-full items-center">
					{[
						{
							icon: <Database className="w-8 h-8" />, 
							title: 'CATALOGUE', 
							desc: 'Découverte Ciblée',
							gradient: 'from-primary/10 to-primary/5',
							border: 'border-primary/30',
							iconColor: 'text-primary'
						},
						{
							icon: <CalendarClock className="w-8 h-8" />, 
							title: 'ÉVÉNEMENTS', 
							desc: 'Réseau & Rythme',
							gradient: 'from-accent/10 to-accent/5',
							border: 'border-accent/30',
							iconColor: 'text-accent'
						},
						{
							icon: <LineChart className="w-8 h-8" />, 
							title: 'PROGRESS', 
							desc: 'Signal Vivant',
							gradient: 'from-secondary/10 to-secondary/5',
							border: 'border-secondary/30',
							iconColor: 'text-secondary'
						},
						{
							icon: <Brain className="w-8 h-8" />, 
							title: 'SCORING', 
							desc: 'Priorisation IA',
							gradient: 'from-primary/10 to-accent/5',
							border: 'border-primary/30',
							iconColor: 'text-primary'
						}
					].map((c,idx)=>(
						<div key={idx} className={`relative group p-8 rounded-3xl border ${c.border} bg-gradient-to-br ${c.gradient} backdrop-blur-sm hover:scale-105 transition-all duration-500 overflow-hidden`}>
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_50%_50%,theme(colors.primary)/0.1,transparent_70%)]" />
							<div className="relative flex flex-col items-center gap-4 text-center">
								<div className={`${c.iconColor} drop-shadow-lg`}>{c.icon}</div>
								<div className="font-bold text-sm tracking-wider">{c.title}</div>
								<div className="text-xs text-muted-foreground leading-tight">{c.desc}</div>
							</div>
							{/* Décoration coin */}
							<div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br ${c.gradient} opacity-60`} />
						</div>
					))}
				</div>
			</div>
		)
	},
	{
		id: 'demo',
		title: 'DÉMO LIVE',
		subtitle: 'Découvrons la plateforme ensemble',
		content: (
			<div className="h-full relative flex items-center justify-center">
				{/* Éléments décoratifs spectaculaires */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
					<div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-tr from-accent/15 to-primary/15 animate-bounce" style={{animationDuration: '4s'}} />
					<div className="absolute top-1/4 right-1/3 w-24 h-24 rounded-full bg-gradient-to-bl from-secondary/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
					<Play className="absolute top-10 right-10 w-12 h-12 text-primary/30 animate-pulse" />
					<Code className="absolute bottom-10 left-10 w-10 h-10 text-accent/30 animate-pulse" style={{animationDelay: '1.5s'}} />
					<Star className="absolute top-32 left-1/3 w-8 h-8 text-secondary/40 animate-pulse" style={{animationDelay: '2s'}} />
					<Diamond className="absolute bottom-32 right-1/4 w-6 h-6 text-primary/50 animate-pulse" style={{animationDelay: '0.5s'}} />
					<Sparkles className="absolute top-1/2 left-20 w-8 h-8 text-accent/40 animate-pulse" style={{animationDelay: '3s'}} />
				</div>
				
				{/* Contenu central */}
				<div className="relative z-10 text-center">
					<div className="mb-12">
						<div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur-sm mb-8">
							<Play className="w-8 h-8 text-primary animate-pulse" />
							<span className="text-2xl font-bold">DÉMO EN DIRECT</span>
							<Eye className="w-8 h-8 text-accent animate-pulse" style={{animationDelay: '1s'}} />
						</div>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl">
							Présentation interactive de la plateforme Survivor
						</p>
					</div>
					
					{/* Bouton de retour stylisé */}
					<Link href="/">
						<Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-12 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
							<ArrowRight className="w-6 h-6 mr-3 rotate-180" />
							Retour au Menu Principal
							<Sparkles className="w-6 h-6 ml-3" />
						</Button>
					</Link>
				</div>
				
				{/* Lignes de connexion décoratives */}
				<div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 via-accent/20 to-transparent" />
				<div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 via-primary/20 to-transparent" />
			</div>
		)
	},
	{
		id: 'communication',
		title: 'COMMUNICATION CLIENT',
		subtitle: 'Qualité • Fréquence • Adaptation',
		content: (
			<div className="h-full relative">
				{/* Décorations améliorées */}
				<MessageSquare className="absolute top-10 right-10 w-12 h-12 text-primary/20 animate-pulse" />
				<Network className="absolute bottom-10 left-10 w-10 h-10 text-accent/20 animate-pulse" style={{animationDelay: '1s'}} />
				<Users className="absolute top-20 left-20 w-8 h-8 text-secondary/25 animate-pulse" style={{animationDelay: '2s'}} />
				<Clock className="absolute bottom-20 right-20 w-8 h-8 text-primary/30 animate-pulse" style={{animationDelay: '3s'}} />
				<BarChart3 className="absolute top-1/2 left-5 w-6 h-6 text-accent/35 animate-pulse" style={{animationDelay: '1.5s'}} />
				<Palette className="absolute bottom-1/3 right-5 w-6 h-6 text-secondary/40 animate-pulse" style={{animationDelay: '2.5s'}} />
				<CheckCircle className="absolute top-1/3 right-1/3 w-5 h-5 text-green-400/40 animate-pulse" style={{animationDelay: '4s'}} />
				<Star className="absolute bottom-1/4 left-1/4 w-5 h-5 text-primary/45 animate-pulse" style={{animationDelay: '0.8s'}} />
				
				<div className="grid md:grid-cols-2 gap-10 h-full items-center">
					{/* Méthodes de communication */}
					<div className="space-y-6">
						<h4 className="text-xl font-bold text-primary mb-6">NOTRE APPROCHE</h4>
						{[
							{icon: <Users className="w-6 h-6" />, title: 'Alignement Initial', desc: 'KPIs • Objectifs • Attentes'},
							{icon: <Clock className="w-6 h-6" />, title: 'Rythme Hebdomadaire', desc: 'Points réguliers • Transparence'},
							{icon: <BarChart3 className="w-6 h-6" />, title: 'Synthèses Courtes', desc: 'Signal clair • Actions concrètes'},
							{icon: <Palette className="w-6 h-6" />, title: 'Ton Adapté', desc: 'Technique ↔ Business selon l&apos;interlocuteur'}
						].map((item, i) => (
							<div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/20">
								<div className="text-primary mt-1">{item.icon}</div>
								<div>
									<div className="font-semibold text-base">{item.title}</div>
									<div className="text-sm text-muted-foreground">{item.desc}</div>
								</div>
							</div>
						))}
					</div>
					
					{/* Résultats */}
					<div className="relative">
						<div className="p-4 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-background backdrop-blur-sm">
							<h4 className="text-lg font-bold text-accent mb-4">RÉSULTATS</h4>
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Communication fluide avec équipe tech</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Adaptation rapide aux changements priorités</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Feedback constructif intégré efficacement</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Relation de confiance établie</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'retro',
		title: 'POST-MORTEM',
		subtitle: 'Réflexion Structurée • Apprentissages • Amélioration',
		content: (
			<div className="h-full relative">
				{/* Décorations améliorées */}
				<Lightbulb className="absolute top-5 right-5 w-8 h-8 text-yellow-400/30 animate-pulse" />
				<Settings className="absolute bottom-5 left-5 w-8 h-8 text-blue-400/30 animate-pulse" style={{animationDelay: '1.5s'}} />
				<Star className="absolute top-20 left-20 w-6 h-6 text-green-400/30 animate-pulse" style={{animationDelay: '2s'}} />
				<AlertTriangle className="absolute bottom-20 right-20 w-6 h-6 text-orange-400/30 animate-pulse" style={{animationDelay: '3s'}} />
				<Rocket className="absolute top-1/2 right-10 w-6 h-6 text-blue-400/30 animate-pulse" style={{animationDelay: '1s'}} />
				<GitBranch className="absolute bottom-1/3 left-10 w-5 h-5 text-purple-400/30 animate-pulse" style={{animationDelay: '2.5s'}} />
				<Diamond className="absolute top-1/3 left-1/2 w-4 h-4 text-accent/40 animate-pulse" style={{animationDelay: '0.5s'}} />
				
				<div className="grid md:grid-cols-3 gap-4 h-full">
					{/* Réussites */}
					<div className="relative">
						<div className="p-3 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10 backdrop-blur-sm h-full">
							<div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
								<CheckCircle className="w-4 h-4 text-green-500" />
							</div>
							<h4 className="font-bold text-base mb-3 text-green-500">RÉUSSITES</h4>
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<Star className="w-3 h-3 text-green-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Itération rapide</span>
								</div>
								<div className="flex items-start gap-2">
									<Star className="w-3 h-3 text-green-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Architecture scalable</span>
								</div>
								<div className="flex items-start gap-2">
									<Star className="w-3 h-3 text-green-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Réactivité équipe</span>
								</div>
								<div className="flex items-start gap-2">
									<Star className="w-3 h-3 text-green-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Communication client</span>
								</div>
							</div>
						</div>
					</div>
					
					{/* Difficultés */}
					<div className="relative">
						<div className="p-3 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10 backdrop-blur-sm h-full">
							<div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
								<AlertTriangle className="w-4 h-4 text-orange-500" />
							</div>
							<h4 className="font-bold text-base mb-3 text-orange-500">DIFFICULTÉS</h4>
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<AlertTriangle className="w-3 h-3 text-orange-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">QA en fin de sprint</span>
								</div>
								<div className="flex items-start gap-2">
									<AlertTriangle className="w-3 h-3 text-orange-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Context switching fréquent</span>
								</div>
								<div className="flex items-start gap-2">
									<AlertTriangle className="w-3 h-3 text-orange-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Définition événements</span>
								</div>
								<div className="flex items-start gap-2">
									<AlertTriangle className="w-3 h-3 text-orange-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Gestion dépendances</span>
								</div>
							</div>
						</div>
					</div>
					
					{/* Améliorations */}
					<div className="relative">
						<div className="p-3 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm h-full">
							<div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
								<GitBranch className="w-4 h-4 text-blue-500" />
							</div>
							<h4 className="font-bold text-base mb-3 text-blue-500">AMÉLIORATIONS</h4>
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<Rocket className="w-3 h-3 text-blue-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Tests automatisés dès J1</span>
								</div>
								<div className="flex items-start gap-2">
									<Rocket className="w-3 h-3 text-blue-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Environnement staging</span>
								</div>
								<div className="flex items-start gap-2">
									<Rocket className="w-3 h-3 text-blue-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Pipeline CI/CD robuste</span>
								</div>
								<div className="flex items-start gap-2">
									<Rocket className="w-3 h-3 text-blue-500/70 mt-1 flex-shrink-0" />
									<span className="text-sm">Documentation continue</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'next',
		title: 'PROCHAINES ÉTAPES',
		subtitle: 'Capital → Impact • Roadmap • Opportunités',
		content: (
			<div className="h-full relative">
				{/* Décorations futuristes améliorées */}
				<div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-bl from-primary/20 to-transparent animate-pulse" />
				<div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-gradient-to-tr from-accent/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
				<Rocket className="absolute top-1/4 right-1/4 w-8 h-8 text-primary/30 animate-pulse" />
				<Star className="absolute bottom-1/4 left-1/4 w-6 h-6 text-accent/40 animate-pulse" style={{animationDelay: '2s'}} />
				<Target className="absolute top-10 left-10 w-6 h-6 text-secondary/40 animate-pulse" style={{animationDelay: '3s'}} />
				<Shield className="absolute bottom-10 right-10 w-6 h-6 text-primary/40 animate-pulse" style={{animationDelay: '1.5s'}} />
				<TrendingUp className="absolute top-1/2 left-5 w-5 h-5 text-accent/50 animate-pulse" style={{animationDelay: '2.5s'}} />
				<Diamond className="absolute bottom-1/3 right-5 w-4 h-4 text-secondary/60 animate-pulse" style={{animationDelay: '0.8s'}} />
				<Sparkles className="absolute top-1/3 right-1/2 w-5 h-5 text-primary/40 animate-pulse" style={{animationDelay: '4s'}} />
				
				<div className="flex flex-col gap-8 h-full">
					{/* Priorités court terme */}
					<div className="grid md:grid-cols-3 gap-4 flex-1">
						{[
							{
								title: 'PRIORITÉS Q1', 
								items: ['Scoring IA avancé', 'Analytics investisseurs', 'Événements live'],
								icon: <Target className="w-5 h-5" />,
								color: 'primary'
							}, 
							{
								title: 'AVANTAGE CONCURRENTIEL', 
								items: ['Données progression', 'Standard signal marché', 'Réseau actif premium'],
								icon: <Shield className="w-5 h-5" />,
								color: 'accent'
							}, 
							{
								title: 'USAGE CAPITAL', 
								items: ['Enrichissement data', 'UX investisseur pro', 'Intégrations partenaires'],
								icon: <TrendingUp className="w-5 h-5" />,
								color: 'secondary'
							}
						].map((section, i) => (
							<div key={i} className={`relative p-3 rounded-xl border border-${section.color}/30 bg-gradient-to-br from-${section.color}/10 to-transparent backdrop-blur-sm`}>
								<div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-${section.color}/20 to-transparent flex items-center justify-center">
									<div className={`text-${section.color}`}>{section.icon}</div>
								</div>
								<h4 className={`font-bold text-sm mb-3 text-${section.color} tracking-wider`}>{section.title}</h4>
								<div className="space-y-1.5">
									{section.items.map((item, j) => (
										<div key={j} className="text-sm text-muted-foreground flex items-center gap-2">
											<div className={`w-1 h-1 rounded-full bg-${section.color}/50`} />
											{item}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
					
					{/* Call to action */}
					<div className="flex items-center justify-between flex-wrap gap-6 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
						<div className="flex-1">
							<p className="text-sm text-muted-foreground mb-2">
								Ouvert pour approfondir : métriques détaillées, modèle économique, roadmap technique
							</p>
							<div className="flex items-center gap-2 text-sm text-primary">
								<Clock className="w-4 h-4" />
								<span>Questions & Discussion</span>
							</div>
						</div>
						<div className="flex gap-3">
							<Link href="/projects">
								<Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
									<Database className="w-4 h-4 mr-2" />
									Catalogue
								</Button>
							</Link>
							<Link href="/dashboard">
								<Button size="sm" variant="outline" className="rounded-full">
									<BarChart3 className="w-4 h-4 mr-2" />
									Dashboard
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}
];

export default function PresentationPage() {
	return (
		<div className="w-full h-dvh flex flex-col">
			<SlideDeck
				slides={slides}
				fullBleed
				autoPlayMs={0}
				className="flex-1"
				showProgress={false}
				showControls={false}
				showDots={false}
				showCounter={false}
			/>
		</div>
	);
}
