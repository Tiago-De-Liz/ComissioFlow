* Busca as informações de comissionamento do vendedor e do gerente
Text to cSqlInfoComissao noShow TextMerge

	SELECT
	  vend.codigo_ven as codigo_vendedor,
	  vend.valfix_ven as valorfixo_vendedor,
	  vend.perven_ven as pervenda_vendedor,
	  gerente.codigo_ven as codigo_gerente,
	  gerente.valfix_ven as valorfixo_gerente,
	  gerente.perven_ven as pervenda_gerente
	FROM negociacao
	  LEFT JOIN funcionario funVend on funVend.codigo_fun = codven_neg
	  LEFT JOIN cargo cargoVendedor on codcar_fun = cargoVendedor.codigo_car
	  LEFT JOIN cargo cargoGerente on cargoVendedor.codsup_car = cargoGerente.codigo_car
	  LEFT JOIN
	    (
	      SELECT codigo_fun, codcar_fun, codemp_pes FROM funcionario
	      JOIN pessoa on codigo_pes = codigo_fun
	      WHERE ativo_fun = 1
	    ) AS funGer ON funGer.codcar_fun = cargoGerente.codigo_car -- and codemp_pes = codemp_neg
	  JOIN vendedor vend on funVend.codigo_fun = vend.codigo_ven
	  JOIN vendedor gerente on funGer.codigo_fun = gerente.codigo_ven
	WHERE codigo_neg = "<<tex(this.codigo_neg.Value)>>"
	LIMIT 1;

EndText
SQL_Select(m.cSqlInfoComissao, "_infoComissao")

* Se possui algum comissionamento para o vendedor ou para o gerente
If (ok(_infoComissao.valorfixo_vendedor) or ok(_infoComissao.pervenda_vendedor)) or ;
   ((ok(_infoComissao.valorfixo_gerente) or ok(_infoComissao.pervenda_gerente)) and ok(_infoComissao.codigo_gerente))
	
	* Informações de comissionamento
	Local comissaoQtdVendasVendedor, comissaoPerVendaVendedor, totalComissaoVendedor, regraComissionamentoVendedor
	Local comissaoQtdVendasGerente, comissaoPerVendaGerente, totalComissaoGerente, regraComissionamentoGerente
	Local comissaoTotalVendedor, comissaoTotalGerente
	
	* Percorre todos os veículos de venda
	seltop("_tmpVeiculosVendas")
	Scan
		
		* Inicialização dos valores de comissão	
		m.comissaoQtdVendasVendedor = 0.00
		m.comissaoPerVendaVendedor = 0.00
		m.comissaoTotalVendedor = 0.00
		m.regraComissionamentoVendedor = ""
		m.comissaoQtdVendasGerente = 0.00
		m.comissaoPerVendaGerente = 0.00
		m.comissaoTotalGerente = 0.00
		m.regraComissionamentoGerente = ""		
		
		* Comissão fixa por quantidade de venda		
		m.comissaoQtdVendasVendedor = _infoComissao.valorfixo_vendedor	
		m.comissaoQtdVendasGerente = _infoComissao.valorfixo_gerente		

		* Comissão pelo percentual do valor de venda
		m.comissaoPerVendaVendedor = (ForceNumber(_tmpVeiculosVendas.valor_nve) * (ForceNumber(_infoComissao.pervenda_vendedor) / 100 ))
		m.comissaoPerVendaGerente = (ForceNumber(_tmpVeiculosVendas.valor_nve) * (ForceNumber(_infoComissao.pervenda_gerente) / 100 ))
		
		
		* Indica o valor total de comissão do vendedor e do gerente	
		m.comissaoTotalVendedor = m.comissaoQtdVendasVendedor + m.comissaoPerVendaVendedor
		m.comissaoTotalGerente = m.comissaoQtdVendasGerente + m.comissaoPerVendaGerente	
		
		* Textualiza a regra de comissionamento aplicada para o vendedor
		If ok(m.comissaoTotalVendedor)	
			
			m.regraComissionamentoVendedor = Concat("Total de comissão: ", GetNF(m.comissaoTotalVendedor,2), ". (")
			
			If ok(m.comissaoQtdVendasVendedor)
				m.regraComissionamentoVendedor = Concat(m.regraComissionamentoVendedor, GetNF(m.comissaoQtdVendasVendedor,2), " por veículo vendido.")
			EndIf
			If ok(m.comissaoPerVendaVendedor)
				m.regraComissionamentoVendedor = Concat(m.regraComissionamentoVendedor," ", ForceNumber(_infoComissao.pervenda_vendedor),"% do valor da venda (", GetNF(m.comissaoPerVendaVendedor,2), ") ")
			EndIf
			
			m.regraComissionamentoVendedor = Concat(m.regraComissionamentoVendedor, ")")
			
		EndIf
		
		* Textualiza a regra de comissionamento aplicada para o gerente
		If ok(m.comissaoTotalGerente)	
			
			m.regraComissionamentoGerente = Concat("Total de comissão: ", GetNF(m.comissaoTotalGerente,2), ". (")
			
			If ok(m.comissaoQtdVendasGerente)
				m.regraComissionamentoGerente = Concat(m.regraComissionamentoGerente, GetNF(m.comissaoQtdVendasGerente,2), " por veículo vendido.")
			EndIf
			If ok(m.comissaoPerVendaGerente)
				m.regraComissionamentoGerente = Concat(m.regraComissionamentoGerente, " ", ForceNumber(_infoComissao.pervenda_gerente),"% do valor da venda (", GetNF(m.comissaoPerVendaGerente,2), ") ")
			EndIf
			
			m.regraComissionamentoGerente = Concat(m.regraComissionamentoGerente, ")")
			
		EndIf
		
		text to cSqlUpdateComissao noShow textMerge
			UPDATE 
				negociacao_veiculos
			SET 
				totcomven_nve = "<<m.comissaoTotalVendedor>>",
				totcomger_nve = "<<m.comissaoTotalGerente>>",
				codgerven_nve = "<<GetOk(_infoComissao.codigo_gerente, "null")>>",
				regcomven_nve = "<<tex(m.regraComissionamentoVendedor)>>",
				regcomger_nve = "<<tex(m.regraComissionamentoGerente)>>"
			WHERE
				codigo_nve = "<<tex(_tmpVeiculosVendas.codigo_nve)>>"
		endText
		Sql_Update(m.cSqlUpdateComissao)
			
	EndScan
	seltop("_tmpVeiculosVendas")	

EndIf